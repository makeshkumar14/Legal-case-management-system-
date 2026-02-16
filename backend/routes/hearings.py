from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.case import Hearing, Case
from models.user import User
from datetime import datetime

hearings_bp = Blueprint("hearings", __name__, url_prefix="/api/hearings")


# ── GET /api/hearings ──────────────────────────────────────────────
@hearings_bp.route("", methods=["GET"])
@jwt_required()
def list_hearings():
    user = User.query.get(int(get_jwt_identity()))
    case_id = request.args.get("case_id", type=int)

    query = Hearing.query

    if case_id:
        query = query.filter_by(case_id=case_id)
    elif user.role == "advocate":
        advocate_case_ids = [c.id for c in Case.query.filter_by(advocate_id=user.id).all()]
        query = query.filter(Hearing.case_id.in_(advocate_case_ids))

    hearings = query.order_by(Hearing.date.desc()).all()
    return jsonify([h.to_dict() for h in hearings]), 200


# ── POST /api/hearings ─────────────────────────────────────────────
@hearings_bp.route("", methods=["POST"])
@jwt_required()
def create_hearing():
    data = request.get_json()
    hearing = Hearing(
        case_id=data["caseId"],
        date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
        type=data.get("type", "Hearing"),
        status="scheduled",
        notes=data.get("notes", ""),
        location=data.get("location", ""),
        start_time=datetime.fromisoformat(data["startTime"]) if data.get("startTime") else None,
        end_time=datetime.fromisoformat(data["endTime"]) if data.get("endTime") else None,
    )
    db.session.add(hearing)

    # Update case next_hearing
    case = Case.query.get(data["caseId"])
    if case and hearing.start_time:
        if not case.next_hearing or hearing.start_time < case.next_hearing:
            case.next_hearing = hearing.start_time
            case.status = "hearing_scheduled"

    db.session.commit()
    return jsonify({"message": "Hearing scheduled", "hearing": hearing.to_dict()}), 201


# ── PUT /api/hearings/<id> ─────────────────────────────────────────
@hearings_bp.route("/<int:hearing_id>", methods=["PUT"])
@jwt_required()
def update_hearing(hearing_id):
    hearing = Hearing.query.get(hearing_id)
    if not hearing:
        return jsonify({"error": "Hearing not found"}), 404

    data = request.get_json()
    hearing.type = data.get("type", hearing.type)
    hearing.status = data.get("status", hearing.status)
    hearing.notes = data.get("notes", hearing.notes)
    hearing.location = data.get("location", hearing.location)

    if data.get("date"):
        hearing.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
    if data.get("startTime"):
        hearing.start_time = datetime.fromisoformat(data["startTime"])
    if data.get("endTime"):
        hearing.end_time = datetime.fromisoformat(data["endTime"])

    db.session.commit()
    return jsonify({"message": "Hearing updated", "hearing": hearing.to_dict()}), 200


# ── DELETE /api/hearings/<id> ──────────────────────────────────────
@hearings_bp.route("/<int:hearing_id>", methods=["DELETE"])
@jwt_required()
def delete_hearing(hearing_id):
    hearing = Hearing.query.get(hearing_id)
    if not hearing:
        return jsonify({"error": "Hearing not found"}), 404

    db.session.delete(hearing)
    db.session.commit()
    return jsonify({"message": "Hearing deleted"}), 200


# ── GET /api/hearings/calendar ─────────────────────────────────────
@hearings_bp.route("/calendar", methods=["GET"])
@jwt_required()
def calendar_events():
    user = User.query.get(int(get_jwt_identity()))

    query = Hearing.query
    if user.role == "advocate":
        advocate_case_ids = [c.id for c in Case.query.filter_by(advocate_id=user.id).all()]
        query = query.filter(Hearing.case_id.in_(advocate_case_ids))

    hearings = query.all()
    return jsonify([h.to_calendar_event() for h in hearings]), 200
