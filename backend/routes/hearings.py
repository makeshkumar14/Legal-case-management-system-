from datetime import datetime, time

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import db
from models.case import Case, CaseTimeline, Hearing
from models.courtroom import Courtroom
from models.notification import Notification
from models.user import User

hearings_bp = Blueprint("hearings", __name__, url_prefix="/api/hearings")


def normalize_name(value):
    return " ".join(str(value or "").split()).strip().lower()


def can_access_case(user, case):
    if user.role == "court":
        return True
    if user.role == "advocate":
        return case.advocate_id == user.id
    if user.role == "public":
        return normalize_name(case.petitioner) == normalize_name(user.name)
    return False


def parse_date_value(value):
    return datetime.strptime(str(value or "").strip(), "%Y-%m-%d").date()


def parse_time_value(value):
    raw_value = str(value or "").strip()
    if not raw_value:
        return None

    if "T" in raw_value:
        raw_value = raw_value.split("T", 1)[1]
    raw_value = raw_value[:5]
    return datetime.strptime(raw_value, "%H:%M").time()


def combine_date_and_time(date_value, time_value):
    if not time_value:
        return datetime.combine(date_value, time.min)
    return datetime.combine(date_value, time_value)


def find_courtroom(name):
    normalized = normalize_name(name)
    if not normalized:
        return None
    rooms = Courtroom.query.all()
    return next((room for room in rooms if normalize_name(room.name) == normalized), None)


def ensure_room_availability(room_name, hearing_date, hearing_time=None, exclude_hearing_id=None):
    if not room_name:
        return None

    room = find_courtroom(room_name)
    if not room:
        return "Selected court room is invalid"
    if room.status == "closed":
        return "Selected court room is currently closed"

    hearings = Hearing.query.filter_by(date=hearing_date, status="scheduled").all()
    for hearing in hearings:
        if exclude_hearing_id and hearing.id == exclude_hearing_id:
            continue
        if normalize_name(hearing.location) != normalize_name(room.name):
            continue

        if not hearing_time or not hearing.start_time:
            return "Selected court room is already booked on this date"

        scheduled_time = hearing.start_time.time().replace(second=0, microsecond=0)
        if scheduled_time == hearing_time.replace(second=0, microsecond=0):
            return "Selected court room is already booked for this time"

    return None


def sync_case_schedule(case):
    scheduled_hearings = [
        hearing
        for hearing in case.hearings
        if hearing.status == "scheduled" and hearing.date
    ]

    if not scheduled_hearings:
        case.next_hearing = None
        return

    next_hearing = min(
        scheduled_hearings,
        key=lambda hearing: hearing.start_time or datetime.combine(hearing.date, time.min),
    )
    case.next_hearing = next_hearing.start_time or datetime.combine(next_hearing.date, time.min)
    if case.status not in {"closed", "dismissed"}:
        case.status = "hearing_scheduled"


def queue_hearing_notifications(case, title, client_message, advocate_message):
    client = next(
        (
            public_user
            for public_user in User.query.filter_by(role="public").all()
            if normalize_name(public_user.name) == normalize_name(case.petitioner)
        ),
        None,
    )
    if client:
        db.session.add(
            Notification(
                user_id=client.id,
                type="hearing",
                title=title,
                message=client_message,
                priority="high",
            )
        )

    if case.advocate_id:
        db.session.add(
            Notification(
                user_id=case.advocate_id,
                type="hearing",
                title=title,
                message=advocate_message,
                priority="high",
            )
        )


def add_timeline_entry(case_id, event, description):
    db.session.add(
        CaseTimeline(
            case_id=case_id,
            date=datetime.utcnow().date(),
            event=event,
            description=description,
        )
    )


@hearings_bp.route("", methods=["GET"])
@jwt_required()
def list_hearings():
    user = User.query.get(int(get_jwt_identity()))
    case_id = request.args.get("case_id", type=int)

    query = Hearing.query.join(Case)
    if case_id:
        query = query.filter(Hearing.case_id == case_id)
    elif user.role == "advocate":
        query = query.filter(Case.advocate_id == user.id)
    elif user.role == "public":
        query = query.filter(db.func.lower(db.func.trim(Case.petitioner)) == normalize_name(user.name))

    hearings = query.order_by(Hearing.date.desc(), Hearing.start_time.desc()).all()
    return jsonify([hearing.to_dict() for hearing in hearings]), 200


@hearings_bp.route("", methods=["POST"])
@jwt_required()
def create_hearing():
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "court":
        return jsonify({"error": "Only court administrators can schedule hearings"}), 403

    data = request.get_json() or {}
    case_id = int(data.get("caseId") or 0)
    if not case_id:
        return jsonify({"error": "Case selection is required"}), 400

    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    try:
        hearing_date = parse_date_value(data.get("date"))
        hearing_time = parse_time_value(data.get("startTime"))
    except ValueError:
        return jsonify({"error": "Please enter a valid hearing date and start time"}), 400

    location = str(data.get("location", "") or "").strip()
    availability_error = ensure_room_availability(location, hearing_date, hearing_time)
    if availability_error:
        return jsonify({"error": availability_error}), 400

    courtroom = find_courtroom(location) if location else None
    hearing = Hearing(
        case_id=case.id,
        date=hearing_date,
        type=str(data.get("type", "Hearing") or "Hearing").strip(),
        status="scheduled",
        notes=str(data.get("notes", "") or "").strip(),
        location=courtroom.name if courtroom else location,
        start_time=combine_date_and_time(hearing_date, hearing_time) if hearing_time else None,
        end_time=None,
    )
    db.session.add(hearing)

    if courtroom:
        case.courtroom_id = courtroom.id
        case.court_room_name = courtroom.name

    db.session.flush()
    sync_case_schedule(case)
    add_timeline_entry(case.id, "Hearing Scheduled", f"{hearing.type} scheduled on {hearing_date.isoformat()}.")
    queue_hearing_notifications(
        case,
        "Hearing Scheduled",
        client_message=f"A hearing for your case '{case.title}' is scheduled on {hearing_date.isoformat()}.",
        advocate_message=f"A hearing for '{case.title}' is scheduled on {hearing_date.isoformat()}.",
    )

    db.session.commit()
    return jsonify({"message": "Hearing scheduled", "hearing": hearing.to_dict()}), 201


@hearings_bp.route("/<int:hearing_id>", methods=["PUT"])
@jwt_required()
def update_hearing(hearing_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "court":
        return jsonify({"error": "Only court administrators can update hearings"}), 403

    hearing = Hearing.query.get(hearing_id)
    if not hearing:
        return jsonify({"error": "Hearing not found"}), 404

    case = Case.query.get(hearing.case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    data = request.get_json() or {}
    try:
        hearing_date = parse_date_value(data.get("date", hearing.date.isoformat()))
        hearing_time = parse_time_value(data.get("startTime")) if "startTime" in data else (
            hearing.start_time.time().replace(second=0, microsecond=0) if hearing.start_time else None
        )
    except ValueError:
        return jsonify({"error": "Please enter a valid hearing date and start time"}), 400

    location = str(data.get("location", hearing.location or "") or "").strip()
    availability_error = ensure_room_availability(location, hearing_date, hearing_time, exclude_hearing_id=hearing.id)
    if availability_error:
        return jsonify({"error": availability_error}), 400

    courtroom = find_courtroom(location) if location else None

    hearing.type = str(data.get("type", hearing.type) or hearing.type).strip()
    hearing.status = str(data.get("status", hearing.status) or hearing.status).strip()
    hearing.notes = str(data.get("notes", hearing.notes or "") or "").strip()
    hearing.location = courtroom.name if courtroom else location
    hearing.date = hearing_date
    hearing.start_time = combine_date_and_time(hearing_date, hearing_time) if hearing_time else None

    if courtroom:
        case.courtroom_id = courtroom.id
        case.court_room_name = courtroom.name

    db.session.flush()
    sync_case_schedule(case)
    add_timeline_entry(case.id, "Hearing Updated", f"{hearing.type} hearing details were updated.")
    queue_hearing_notifications(
        case,
        "Hearing Updated",
        client_message=f"The hearing details for your case '{case.title}' were updated.",
        advocate_message=f"The hearing details for '{case.title}' were updated.",
    )

    db.session.commit()
    return jsonify({"message": "Hearing updated", "hearing": hearing.to_dict()}), 200


@hearings_bp.route("/<int:hearing_id>", methods=["DELETE"])
@jwt_required()
def delete_hearing(hearing_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "court":
        return jsonify({"error": "Only court administrators can delete hearings"}), 403

    hearing = Hearing.query.get(hearing_id)
    if not hearing:
        return jsonify({"error": "Hearing not found"}), 404

    case = Case.query.get(hearing.case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    hearing_label = hearing.type
    db.session.delete(hearing)
    db.session.flush()
    sync_case_schedule(case)
    add_timeline_entry(case.id, "Hearing Removed", f"{hearing_label} hearing was removed from the schedule.")
    db.session.commit()
    return jsonify({"message": "Hearing deleted"}), 200


@hearings_bp.route("/calendar", methods=["GET"])
@jwt_required()
def calendar_events():
    user = User.query.get(int(get_jwt_identity()))

    query = Hearing.query.join(Case)
    if user.role == "advocate":
        query = query.filter(Case.advocate_id == user.id)
    elif user.role == "public":
        query = query.filter(db.func.lower(db.func.trim(Case.petitioner)) == normalize_name(user.name))

    hearings = query.order_by(Hearing.date.asc(), Hearing.start_time.asc()).all()
    return jsonify([hearing.to_calendar_event() for hearing in hearings]), 200
