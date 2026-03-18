import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db
from models.document import Document
from models.user import User

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "gif", "mp4", "doc", "docx", "xls", "xlsx"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── GET /api/documents ─────────────────────────────────────────────
@documents_bp.route("", methods=["GET"])
@jwt_required()
def list_documents():
    case_id = request.args.get("case_id", type=int)
    status_filter = request.args.get("status")

    query = Document.query
    if case_id:
        query = query.filter_by(case_id=case_id)
    if status_filter == "verified":
        query = query.filter_by(verified=True)
    elif status_filter == "pending":
        query = query.filter_by(verified=False)

    docs = query.order_by(Document.uploaded_at.desc()).all()
    return jsonify([d.to_dict() for d in docs]), 200


# ── POST /api/documents ────────────────────────────────────────────
@documents_bp.route("", methods=["POST"])
@jwt_required()
def upload_document():
    user_id = int(get_jwt_identity())

    # Handle file upload
    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        filename = secure_filename(file.filename)
        upload_dir = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)

        ext = filename.rsplit(".", 1)[1].lower()
        file_size = os.path.getsize(filepath)
        size_str = f"{file_size / (1024 * 1024):.1f} MB" if file_size > 1024 * 1024 else f"{file_size / 1024:.1f} KB"

        doc_type = "Image" if ext in ("jpg", "jpeg", "png", "gif") else "Video" if ext == "mp4" else "Document"

        doc = Document(
            case_id=int(request.form.get("caseId", 0)),
            uploaded_by=user_id,
            title=request.form.get("title", filename),
            doc_type=doc_type,
            file_type=ext,
            file_path=filepath,
            file_size=size_str,
            verified=False,
        )
    else:
        # JSON-only (metadata without file)
        data = request.get_json()
        doc = Document(
            case_id=data["caseId"],
            uploaded_by=user_id,
            title=data["title"],
            doc_type=data.get("docType", "Document"),
            file_type=data.get("fileType", "pdf"),
            file_path=data.get("filePath"),
            file_size=data.get("fileSize", "0 KB"),
            verified=False,
        )

    db.session.add(doc)
    db.session.commit()
    return jsonify({"message": "Document uploaded", "document": doc.to_dict()}), 201


# ── PUT /api/documents/<id>/verify ─────────────────────────────────
@documents_bp.route("/<int:doc_id>/verify", methods=["PUT"])
@jwt_required()
def verify_document(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    doc.verified = True
    db.session.commit()
    return jsonify({"message": "Document verified", "document": doc.to_dict()}), 200


# ── DELETE /api/documents/<id> ─────────────────────────────────────
@documents_bp.route("/<int:doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    # Remove physical file
    if doc.file_path and os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.session.delete(doc)
    db.session.commit()
    return jsonify({"message": "Document deleted"}), 200
