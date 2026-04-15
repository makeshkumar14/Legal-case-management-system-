from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import db
from models.case import Hearing
from models.courtroom import Courtroom
from models.user import User

courtrooms_bp = Blueprint("courtrooms", __name__, url_prefix="/api/courtrooms")


def normalize_name(value):
    return " ".join(str(value or "").split()).strip().lower()


def parse_time_value(value):
    raw_value = str(value or "").strip()
    if not raw_value:
        return None

    if "T" in raw_value:
        raw_value = raw_value.split("T", 1)[1]
    raw_value = raw_value[:5]
    return datetime.strptime(raw_value, "%H:%M").time()


def serialize_room(room, is_available=True, availability_reason=None):
    data = room.to_dict()
    data["isAvailable"] = is_available
    data["availabilityReason"] = availability_reason
    return data


@courtrooms_bp.route("", methods=["GET"])
@jwt_required()
def list_courtrooms():
    status_filter = request.args.get("status")
    query = Courtroom.query

    if status_filter:
        query = query.filter_by(status=status_filter)

    rooms = query.order_by(Courtroom.id.asc()).all()
    return jsonify([room.to_dict() for room in rooms]), 200


@courtrooms_bp.route("/availability", methods=["GET"])
@jwt_required()
def courtroom_availability():
    date_value = request.args.get("date")
    start_time_value = request.args.get("startTime")
    exclude_hearing_id = request.args.get("excludeHearingId", type=int)

    if not date_value:
        return jsonify({"error": "Date is required"}), 400

    try:
        hearing_date = datetime.strptime(date_value, "%Y-%m-%d").date()
        hearing_time = parse_time_value(start_time_value)
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400

    hearings = Hearing.query.filter_by(date=hearing_date, status="scheduled").all()
    occupied_rooms = {}

    for hearing in hearings:
        if exclude_hearing_id and hearing.id == exclude_hearing_id:
            continue
        room_key = normalize_name(hearing.location)
        if not room_key:
            continue

        if not hearing_time:
            occupied_rooms[room_key] = "Already assigned on the selected date"
            continue

        if not hearing.start_time:
            occupied_rooms[room_key] = "Already assigned on the selected date"
            continue

        scheduled_time = hearing.start_time.time().replace(second=0, microsecond=0)
        if scheduled_time == hearing_time.replace(second=0, microsecond=0):
            occupied_rooms[room_key] = "Already booked for the selected time"

    rooms = Courtroom.query.order_by(Courtroom.id.asc()).all()
    return jsonify(
        [
            serialize_room(
                room,
                is_available=normalize_name(room.name) not in occupied_rooms and room.status != "closed",
                availability_reason=occupied_rooms.get(normalize_name(room.name)) or ("Room is closed" if room.status == "closed" else None),
            )
            for room in rooms
        ]
    ), 200


@courtrooms_bp.route("/<int:room_id>", methods=["PUT"])
@jwt_required()
def update_courtroom(room_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "court":
        return jsonify({"error": "Only court administrators can update courtrooms"}), 403

    room = Courtroom.query.get(room_id)
    if not room:
        return jsonify({"error": "Courtroom not found"}), 404

    data = request.get_json() or {}
    room.status = data.get("status", room.status)
    room.judge = data.get("judge", room.judge)
    room.current_case = data.get("currentCase", room.current_case)
    room.case_title = data.get("caseTitle", room.case_title)
    room.start_time = data.get("startTime", room.start_time)
    room.case_type = data.get("type", room.case_type)

    db.session.commit()
    return jsonify({"message": "Courtroom updated", "courtroom": room.to_dict()}), 200
