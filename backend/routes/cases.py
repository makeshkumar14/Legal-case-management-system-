from datetime import date, datetime

from flask import Blueprint, Response, current_app, jsonify, request, url_for
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import db
from models.case import Case, CaseTimeline, Hearing
from models.courtroom import Courtroom
from models.notification import Notification
from models.user import User
from utils.exporters import (
    build_case_csv,
    build_case_report_lines,
    build_share_token,
    generate_simple_pdf,
    load_share_token,
    sanitize_filename,
)

cases_bp = Blueprint("cases", __name__, url_prefix="/api/cases")

ACTIVE_CASE_STATUSES = {"filed", "under_review", "hearing_scheduled", "in_progress", "judgment_reserved"}
ALLOWED_CASE_STATUSES = ACTIVE_CASE_STATUSES | {"closed", "dismissed"}
ALLOWED_PRIORITIES = {"low", "medium", "high"}


def normalize_name(value):
    return " ".join(str(value or "").split()).strip().lower()


def apply_case_scope(query, user):
    if user.role == "advocate":
        return query.filter_by(advocate_id=user.id)
    if user.role == "public":
        normalized_name = normalize_name(user.name)
        return query.filter(db.func.lower(db.func.trim(Case.petitioner)) == normalized_name)
    return query


def can_access_case(user, case):
    if user.role == "court":
        return True
    if user.role == "advocate":
        return case.advocate_id == user.id
    if user.role == "public":
        return normalize_name(case.petitioner) == normalize_name(user.name)
    return False


def build_case_number():
    return f"CS/{date.today().year}/{Case.query.count() + 1:04d}"


def parse_next_hearing(value):
    raw_value = str(value or "").strip()
    if not raw_value:
        return None

    try:
        if "T" in raw_value:
            return datetime.fromisoformat(raw_value)
        return datetime.strptime(raw_value, "%Y-%m-%d")
    except ValueError as exc:
        raise ValueError("Invalid next hearing date format") from exc


def find_public_user_by_name(name):
    normalized = normalize_name(name)
    if not normalized:
        return None

    public_users = User.query.filter_by(role="public").all()
    return next((candidate for candidate in public_users if normalize_name(candidate.name) == normalized), None)


def find_courtroom_by_name(name):
    normalized = normalize_name(name)
    if not normalized:
        return None

    rooms = Courtroom.query.all()
    return next((room for room in rooms if normalize_name(room.name) == normalized), None)


def sync_advocate_active_cases(*advocate_ids):
    valid_ids = {int(advocate_id) for advocate_id in advocate_ids if advocate_id}
    if not valid_ids:
        return

    for advocate_id in valid_ids:
        advocate = User.query.get(advocate_id)
        if not advocate or advocate.role != "advocate":
            continue
        advocate.active_cases = Case.query.filter(
            Case.advocate_id == advocate_id,
            Case.status.in_(list(ACTIVE_CASE_STATUSES)),
        ).count()


def queue_case_notification(case, title, client_message=None, advocate_message=None, priority="medium"):
    client = find_public_user_by_name(case.petitioner)
    if client and client_message:
        db.session.add(
            Notification(
                user_id=client.id,
                type="update",
                title=title,
                message=client_message,
                priority=priority,
            )
        )

    if case.advocate_id and advocate_message:
        db.session.add(
            Notification(
                user_id=case.advocate_id,
                type="update",
                title=title,
                message=advocate_message,
                priority=priority,
            )
        )


def add_timeline_entry(case_id, event, description):
    db.session.add(
        CaseTimeline(
            case_id=case_id,
            date=date.today(),
            event=event,
            description=description,
        )
    )


def ensure_hearing_entry(case, hearing_at):
    existing = (
        Hearing.query.filter_by(case_id=case.id)
        .filter(Hearing.date == hearing_at.date())
        .order_by(Hearing.id.desc())
        .first()
    )

    if existing:
        existing.status = "scheduled"
        existing.location = case.court_room_name or existing.location
        existing.start_time = hearing_at
        if not existing.type:
            existing.type = "Case Hearing"
        return existing, False

    hearing = Hearing(
        case_id=case.id,
        date=hearing_at.date(),
        type="Case Hearing",
        status="scheduled",
        location=case.court_room_name,
        start_time=hearing_at,
    )
    db.session.add(hearing)
    return hearing, True


def apply_case_payload(case, data, user, is_create=False):
    title = str(data.get("title", case.title if case else "") or "").strip()
    petitioner = str(data.get("petitioner", case.petitioner if case else "") or "").strip()
    respondent = str(data.get("respondent", case.respondent if case else "") or "").strip()
    case_type = str(data.get("caseType", case.case_type if case else "Civil") or "Civil").strip()
    priority = str(data.get("priority", case.priority if case else "medium") or "medium").strip().lower()
    status = str(data.get("status", case.status if case else "filed") or "filed").strip().lower()
    description = str(data.get("description", case.description if case else "") or "").strip()
    judge = str(data.get("judge", case.judge if case else "") or "").strip() or None
    room_name = str(data.get("courtRoom", case.court_room_name if case else "") or "").strip()
    case_number = str(data.get("caseNumber", case.case_number if case else "") or "").strip()
    advocate_id_raw = data.get("advocateId", case.advocate_id if case else None)

    if not title:
        raise ValueError("Case title is required")
    if not petitioner:
        raise ValueError("Petitioner name is required")
    if not respondent:
        raise ValueError("Respondent name is required")
    if priority not in ALLOWED_PRIORITIES:
        raise ValueError("Invalid priority selected")
    if status not in ALLOWED_CASE_STATUSES:
        raise ValueError("Invalid case status selected")

    if user.role == "advocate":
        if advocate_id_raw in ("", None):
            advocate_id = user.id
        else:
            advocate_id = int(advocate_id_raw)
            if advocate_id != user.id:
                raise ValueError("Advocates can only assign themselves to a case")
    else:
        advocate_id = int(advocate_id_raw) if str(advocate_id_raw or "").strip() else None

    advocate = None
    if advocate_id:
        advocate = User.query.get(advocate_id)
        if not advocate or advocate.role != "advocate":
            raise ValueError("Selected advocate does not exist")

    matched_client = find_public_user_by_name(petitioner)
    if matched_client:
        petitioner = matched_client.name

    courtroom = None
    if room_name:
        courtroom = find_courtroom_by_name(room_name)
        if not courtroom:
            raise ValueError("Selected court room is invalid")
        room_name = courtroom.name

    next_hearing = parse_next_hearing(data.get("nextHearing")) if "nextHearing" in data else (case.next_hearing if case else None)
    if status in {"closed", "dismissed"}:
        next_hearing = None
    elif next_hearing:
        status = "hearing_scheduled"

    if is_create:
        if not case_number:
            case_number = build_case_number()
        if Case.query.filter_by(case_number=case_number).first():
            raise ValueError("Case number already exists")
    elif case_number and case_number != case.case_number:
        existing_case = Case.query.filter_by(case_number=case_number).first()
        if existing_case and existing_case.id != case.id:
            raise ValueError("Case number already exists")

    return {
        "title": title,
        "petitioner": petitioner,
        "respondent": respondent,
        "case_type": case_type,
        "priority": priority,
        "status": status,
        "description": description,
        "judge": judge,
        "court_room_name": room_name or None,
        "courtroom_id": courtroom.id if courtroom else None,
        "advocate_id": advocate_id,
        "next_hearing": next_hearing,
        "case_number": case_number or case.case_number,
    }


def build_pdf_response(case, attachment=False):
    title = f"Case Report - {case.case_number}"
    payload = generate_simple_pdf(title, build_case_report_lines(case))
    filename = f"{sanitize_filename(case.case_number)}-report.pdf"
    disposition = "attachment" if attachment else "inline"
    return Response(
        payload,
        mimetype="application/pdf",
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )


def build_case_details_payload(case, pdf_url=None):
    payload = case.to_dict(include_details=True)
    payload["reportText"] = "\n".join(build_case_report_lines(case))
    if pdf_url:
        payload["pdfUrl"] = pdf_url
    return payload


def get_accessible_case_or_404(case_id, user):
    case = Case.query.get(case_id)
    if not case:
        return None, (jsonify({"error": "Case not found"}), 404)
    if not can_access_case(user, case):
        return None, (jsonify({"error": "You do not have access to this case"}), 403)
    return case, None


@cases_bp.route("", methods=["GET"])
@jwt_required()
def list_cases():
    user = User.query.get(int(get_jwt_identity()))
    status_filter = request.args.get("status")
    case_type = request.args.get("type")
    priority = request.args.get("priority")

    query = apply_case_scope(Case.query, user)

    if status_filter:
        query = query.filter_by(status=status_filter)
    if case_type:
        query = query.filter_by(case_type=case_type)
    if priority:
        query = query.filter_by(priority=priority)

    cases = query.order_by(Case.created_at.desc()).all()
    return jsonify([case.to_dict() for case in cases]), 200


@cases_bp.route("/<int:case_id>", methods=["GET"])
@jwt_required()
def get_case(case_id):
    user = User.query.get(int(get_jwt_identity()))
    case, error = get_accessible_case_or_404(case_id, user)
    if error:
        return error
    return jsonify(case.to_dict(include_details=True)), 200


@cases_bp.route("", methods=["POST"])
@jwt_required()
def create_case():
    user = User.query.get(int(get_jwt_identity()))
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court or advocate can create cases"}), 403

    data = request.get_json() or {}

    try:
        payload = apply_case_payload(None, data, user, is_create=True)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    case = Case(
        case_number=payload["case_number"],
        title=payload["title"],
        description=payload["description"],
        case_type=payload["case_type"],
        status=payload["status"],
        priority=payload["priority"],
        petitioner=payload["petitioner"],
        respondent=payload["respondent"],
        advocate_id=payload["advocate_id"],
        judge=payload["judge"],
        courtroom_id=payload["courtroom_id"],
        court_room_name=payload["court_room_name"],
        filing_date=date.today(),
        next_hearing=payload["next_hearing"],
    )
    db.session.add(case)
    db.session.flush()

    add_timeline_entry(case.id, "Case Filed", "Case registered with Court Registry")

    if payload["next_hearing"]:
        ensure_hearing_entry(case, payload["next_hearing"])
        add_timeline_entry(
            case.id,
            "Hearing Scheduled",
            f"Next hearing scheduled for {payload['next_hearing'].strftime('%d %b %Y')}",
        )
        queue_case_notification(
            case,
            "Case Registered",
            client_message=f"Your case '{case.title}' has been registered and a hearing has been scheduled.",
            advocate_message=f"You have been assigned to the case '{case.title}' with a scheduled hearing.",
            priority="high",
        )
    else:
        queue_case_notification(
            case,
            "Case Registered",
            client_message=f"Your case '{case.title}' has been registered in the system.",
            advocate_message=f"You have been assigned to the case '{case.title}'.",
            priority="medium",
        )

    sync_advocate_active_cases(case.advocate_id)
    db.session.commit()
    return jsonify({"message": "Case created", "case": case.to_dict()}), 201


@cases_bp.route("/<int:case_id>", methods=["PUT"])
@jwt_required()
def update_case(case_id):
    user = User.query.get(int(get_jwt_identity()))
    case, error = get_accessible_case_or_404(case_id, user)
    if error:
        return error
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court or advocate can update cases"}), 403

    data = request.get_json() or {}
    old_advocate_id = case.advocate_id
    previous_status = case.status
    previous_next_hearing = case.next_hearing

    try:
        payload = apply_case_payload(case, data, user, is_create=False)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    case.case_number = payload["case_number"]
    case.title = payload["title"]
    case.description = payload["description"]
    case.case_type = payload["case_type"]
    case.status = payload["status"]
    case.priority = payload["priority"]
    case.petitioner = payload["petitioner"]
    case.respondent = payload["respondent"]
    case.advocate_id = payload["advocate_id"]
    case.judge = payload["judge"]
    case.courtroom_id = payload["courtroom_id"]
    case.court_room_name = payload["court_room_name"]
    case.next_hearing = payload["next_hearing"]

    status_changed = case.status != previous_status
    next_hearing_changed = payload["next_hearing"] and payload["next_hearing"] != previous_next_hearing
    if status_changed:
        previous_status_label = previous_status.replace("_", " ").title()
        next_status_label = case.status.replace("_", " ").title()
        add_timeline_entry(
            case.id,
            "Case Status Updated",
            f"Status changed from {previous_status_label} to {next_status_label}.",
        )

        if not next_hearing_changed or case.status in {"closed", "dismissed"}:
            queue_case_notification(
                case,
                "Case Status Updated",
                client_message=f"Your case '{case.title}' status is now {next_status_label}.",
                advocate_message=f"Case '{case.title}' status is now {next_status_label}.",
                priority="high" if case.status in {"closed", "dismissed"} else "medium",
            )

    if next_hearing_changed:
        ensure_hearing_entry(case, payload["next_hearing"])
        add_timeline_entry(
            case.id,
            "Hearing Scheduled",
            f"Next hearing scheduled for {payload['next_hearing'].strftime('%d %b %Y')}",
        )
        queue_case_notification(
            case,
            "Hearing Scheduled",
            client_message=f"A hearing for your case '{case.title}' is scheduled for {payload['next_hearing'].strftime('%d %b %Y')}.",
            advocate_message=f"Hearing scheduled for '{case.title}' on {payload['next_hearing'].strftime('%d %b %Y')}.",
            priority="high",
        )

    if case.advocate_id != old_advocate_id:
        queue_case_notification(
            case,
            "Case Updated",
            client_message=f"Your case '{case.title}' has been updated.",
            advocate_message=f"You are now assigned to the case '{case.title}'.",
            priority="medium",
        )

    sync_advocate_active_cases(old_advocate_id, case.advocate_id)
    db.session.commit()
    return jsonify({"message": "Case updated", "case": case.to_dict()}), 200


@cases_bp.route("/<int:case_id>", methods=["DELETE"])
@jwt_required()
def delete_case(case_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "court":
        return jsonify({"error": "Only court can delete cases"}), 403

    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    advocate_id = case.advocate_id
    db.session.delete(case)
    db.session.flush()
    sync_advocate_active_cases(advocate_id)
    db.session.commit()
    return jsonify({"message": "Case deleted"}), 200


@cases_bp.route("/search", methods=["GET"])
@jwt_required()
def search_cases():
    user = User.query.get(int(get_jwt_identity()))
    query_text = request.args.get("q", "").strip()
    if not query_text:
        return jsonify([]), 200

    results = apply_case_scope(Case.query, user).filter(
        db.or_(
            Case.case_number.ilike(f"%{query_text}%"),
            Case.title.ilike(f"%{query_text}%"),
            Case.petitioner.ilike(f"%{query_text}%"),
            Case.respondent.ilike(f"%{query_text}%"),
            Case.case_type.ilike(f"%{query_text}%"),
        )
    ).limit(20).all()

    return jsonify([case.to_dict() for case in results]), 200


@cases_bp.route("/qr/<case_number>", methods=["GET"])
@jwt_required()
def qr_lookup(case_number):
    user = User.query.get(int(get_jwt_identity()))
    case = Case.query.filter_by(case_number=case_number).first()
    if not case:
        return jsonify({"error": "Case not found"}), 404
    if not can_access_case(user, case):
        return jsonify({"error": "You do not have access to this case"}), 403
    share_token = build_share_token(current_app.config["JWT_SECRET_KEY"], case)
    return jsonify(
        build_case_details_payload(
            case,
            pdf_url=url_for("cases.shared_case_pdf", token=share_token, _external=True),
        )
    ), 200


@cases_bp.route("/<int:case_id>/report-links", methods=["GET"])
@jwt_required()
def case_report_links(case_id):
    user = User.query.get(int(get_jwt_identity()))
    case, error = get_accessible_case_or_404(case_id, user)
    if error:
        return error

    share_token = build_share_token(current_app.config["JWT_SECRET_KEY"], case)
    return jsonify(
        {
            "pdfUrl": url_for("cases.shared_case_pdf", token=share_token, _external=True),
            "authPdfUrl": url_for("cases.export_case_pdf", case_id=case.id, _external=True),
            "csvUrl": url_for("cases.export_case_csv", case_id=case.id, _external=True),
        }
    ), 200


@cases_bp.route("/<int:case_id>/export.csv", methods=["GET"])
@jwt_required()
def export_case_csv(case_id):
    user = User.query.get(int(get_jwt_identity()))
    case, error = get_accessible_case_or_404(case_id, user)
    if error:
        return error

    filename = f"{sanitize_filename(case.case_number)}-details.csv"
    return Response(
        build_case_csv(case),
        mimetype="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@cases_bp.route("/<int:case_id>/report.pdf", methods=["GET"])
@jwt_required()
def export_case_pdf(case_id):
    user = User.query.get(int(get_jwt_identity()))
    case, error = get_accessible_case_or_404(case_id, user)
    if error:
        return error
    return build_pdf_response(case)


@cases_bp.route("/shared/report/<token>.pdf", methods=["GET"])
def shared_case_pdf(token):
    payload = load_share_token(current_app.config["JWT_SECRET_KEY"], token)
    if not payload:
        return jsonify({"error": "Invalid share link"}), 404

    case = Case.query.get(payload.get("case_id"))
    if not case or case.case_number != payload.get("case_number"):
        return jsonify({"error": "Case not found"}), 404
    return build_pdf_response(case)


@cases_bp.route("/shared/report/<token>/details", methods=["GET"])
def shared_case_details(token):
    payload = load_share_token(current_app.config["JWT_SECRET_KEY"], token)
    if not payload:
        return jsonify({"error": "Invalid share link"}), 404

    case = Case.query.get(payload.get("case_id"))
    if not case or case.case_number != payload.get("case_number"):
        return jsonify({"error": "Case not found"}), 404

    return jsonify(
        build_case_details_payload(
            case,
            pdf_url=url_for("cases.shared_case_pdf", token=token, _external=True),
        )
    ), 200
