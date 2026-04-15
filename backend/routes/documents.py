import os
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.utils import secure_filename

from models import db
from models.case import Case, CaseTimeline
from models.document import Document
from models.notification import Notification
from models.user import User
from utils.exporters import sanitize_filename

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "gif", "mp4", "doc", "docx", "xls", "xlsx"}


def normalize_name(value):
    return " ".join(str(value or "").split()).strip().lower()


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def can_access_case(user, case):
    if user.role == "court":
        return True
    if user.role == "advocate":
        return case.advocate_id == user.id
    if user.role == "public":
        return normalize_name(case.petitioner) == normalize_name(user.name)
    return False


def resolve_case(case_id, user):
    case = Case.query.get(case_id)
    if not case:
        return None, (jsonify({"error": "Case not found"}), 404)
    if not can_access_case(user, case):
        return None, (jsonify({"error": "You do not have access to this case"}), 403)
    return case, None


def build_document_type(extension):
    if extension in {"jpg", "jpeg", "png", "gif"}:
        return "Image"
    if extension == "mp4":
        return "Video"
    return "Document"


def build_storage_path(filename):
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    safe_name = secure_filename(filename)
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    return os.path.join(upload_dir, f"{timestamp}_{safe_name}")


def format_file_size(path):
    file_size = os.path.getsize(path)
    return f"{file_size / (1024 * 1024):.1f} MB" if file_size > 1024 * 1024 else f"{file_size / 1024:.1f} KB"


def queue_document_notifications(case, title, client_message, advocate_message, priority="medium"):
    client = next(
        (
            public_user
            for public_user in User.query.filter_by(role="public").all()
            if normalize_name(public_user.name) == normalize_name(case.petitioner)
        ),
        None,
    )
    if client and client_message:
        db.session.add(
            Notification(
                user_id=client.id,
                type="document",
                title=title,
                message=client_message,
                priority=priority,
            )
        )

    if case.advocate_id and advocate_message:
        db.session.add(
            Notification(
                user_id=case.advocate_id,
                type="document",
                title=title,
                message=advocate_message,
                priority=priority,
            )
        )


def add_timeline_entry(case_id, title, description):
    db.session.add(
        CaseTimeline(
            case_id=case_id,
            date=datetime.utcnow().date(),
            event=title,
            description=description,
        )
    )


@documents_bp.route("", methods=["GET"])
@jwt_required()
def list_documents():
    user = User.query.get(int(get_jwt_identity()))
    case_id = request.args.get("case_id", type=int)
    status_filter = request.args.get("status")

    query = Document.query.join(Case)
    if user.role == "advocate":
        query = query.filter(Case.advocate_id == user.id)
    elif user.role == "public":
        query = query.filter(db.func.lower(db.func.trim(Case.petitioner)) == normalize_name(user.name))

    if case_id:
        query = query.filter(Document.case_id == case_id)
    if status_filter == "verified":
        query = query.filter(Document.verified.is_(True))
    elif status_filter == "pending":
        query = query.filter(Document.verified.is_(False))

    docs = query.order_by(Document.uploaded_at.desc()).all()
    return jsonify([document.to_dict() for document in docs]), 200


@documents_bp.route("", methods=["POST"])
@jwt_required()
def upload_document():
    user = User.query.get(int(get_jwt_identity()))
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court or advocate can upload documents"}), 403

    case_id_raw = request.form.get("caseId") if request.form else None
    payload = request.get_json(silent=True) or {}
    case_id = int(case_id_raw or payload.get("caseId") or 0)
    if not case_id:
        return jsonify({"error": "Case selection is required"}), 400

    case, error = resolve_case(case_id, user)
    if error:
        return error

    file = request.files.get("file")
    if file:
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        file_path = build_storage_path(file.filename)
        file.save(file_path)
        extension = file.filename.rsplit(".", 1)[1].lower()
        document = Document(
            case_id=case.id,
            uploaded_by=user.id,
            title=request.form.get("title", file.filename),
            doc_type=build_document_type(extension),
            file_type=extension,
            file_path=file_path,
            file_size=format_file_size(file_path),
            verified=False,
        )
    else:
        title = str(payload.get("title", "") or "").strip()
        file_type = str(payload.get("fileType", "pdf") or "pdf").strip().lower()
        if not title:
            return jsonify({"error": "Document title is required"}), 400
        document = Document(
            case_id=case.id,
            uploaded_by=user.id,
            title=title,
            doc_type=str(payload.get("docType", "Document") or "Document"),
            file_type=file_type,
            file_path=payload.get("filePath"),
            file_size=payload.get("fileSize", "0 KB"),
            verified=False,
        )

    db.session.add(document)
    add_timeline_entry(case.id, "Document Uploaded", f"{document.title} uploaded to the case record.")
    queue_document_notifications(
        case,
        "New Document Uploaded",
        client_message=f"A new document '{document.title}' was uploaded for your case '{case.title}'.",
        advocate_message=f"A new document '{document.title}' was uploaded for '{case.title}'.",
        priority="medium",
    )
    db.session.commit()
    return jsonify({"message": "Document uploaded", "document": document.to_dict()}), 201


@documents_bp.route("/<int:doc_id>", methods=["PUT"])
@jwt_required()
def update_document(doc_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court or advocate can update documents"}), 403

    document = Document.query.get(doc_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404

    case, error = resolve_case(document.case_id, user)
    if error:
        return error

    payload = request.get_json(silent=True) or {}
    target_case_id = request.form.get("caseId") if request.form else None
    if target_case_id or payload.get("caseId"):
        next_case_id = int(target_case_id or payload.get("caseId"))
        next_case, next_case_error = resolve_case(next_case_id, user)
        if next_case_error:
            return next_case_error
        document.case_id = next_case.id
        case = next_case

    title = (request.form.get("title") if request.form else None) or payload.get("title")
    if title is not None:
        document.title = str(title).strip() or document.title

    file = request.files.get("file")
    old_path = document.file_path
    if file:
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400
        file_path = build_storage_path(file.filename)
        file.save(file_path)
        extension = file.filename.rsplit(".", 1)[1].lower()
        document.file_path = file_path
        document.file_type = extension
        document.doc_type = build_document_type(extension)
        document.file_size = format_file_size(file_path)

    document.verified = False
    add_timeline_entry(case.id, "Document Updated", f"{document.title} was updated.")
    queue_document_notifications(
        case,
        "Document Updated",
        client_message=f"The document '{document.title}' was updated for your case '{case.title}'.",
        advocate_message=f"The document '{document.title}' was updated for '{case.title}'.",
        priority="medium",
    )
    db.session.commit()

    if file and old_path and old_path != document.file_path and os.path.exists(old_path):
        os.remove(old_path)

    return jsonify({"message": "Document updated", "document": document.to_dict()}), 200


@documents_bp.route("/<int:doc_id>/verify", methods=["PUT"])
@jwt_required()
def verify_document(doc_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court or advocate can verify documents"}), 403

    document = Document.query.get(doc_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404

    case, error = resolve_case(document.case_id, user)
    if error:
        return error

    document.verified = True
    add_timeline_entry(case.id, "Document Verified", f"{document.title} was verified.")
    db.session.commit()
    return jsonify({"message": "Document verified", "document": document.to_dict()}), 200


@documents_bp.route("/<int:doc_id>/file", methods=["GET"])
@jwt_required()
def view_document_file(doc_id):
    user = User.query.get(int(get_jwt_identity()))
    document = Document.query.get(doc_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404

    _, error = resolve_case(document.case_id, user)
    if error:
        return error

    if not document.file_path or not os.path.exists(document.file_path):
        return jsonify({"error": "Stored file not found"}), 404

    download = str(request.args.get("download", "false")).lower() == "true"
    download_name = f"{sanitize_filename(document.title, 'document')}.{document.file_type}"
    return send_file(document.file_path, as_attachment=download, download_name=download_name)


@documents_bp.route("/<int:doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court or advocate can delete documents"}), 403

    document = Document.query.get(doc_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404

    case, error = resolve_case(document.case_id, user)
    if error:
        return error

    file_path = document.file_path
    title = document.title
    db.session.delete(document)
    add_timeline_entry(case.id, "Document Removed", f"{title} was removed from the case record.")
    queue_document_notifications(
        case,
        "Document Removed",
        client_message=f"The document '{title}' was removed from your case '{case.title}'.",
        advocate_message=f"The document '{title}' was removed from '{case.title}'.",
        priority="low",
    )
    db.session.commit()

    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    return jsonify({"message": "Document deleted"}), 200
