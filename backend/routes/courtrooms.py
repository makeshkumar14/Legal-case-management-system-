from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db
from models.courtroom import Courtroom

courtrooms_bp = Blueprint("courtrooms", __name__, url_prefix="/api/courtrooms")


# ── GET /api/courtrooms ───────────────────────────────────────────
@courtrooms_bp.route("", methods=["GET"])
@jwt_required()
def list_courtrooms():
    status_filter = request.args.get("status")
    query = Courtroom.query

    if status_filter:
        query = query.filter_by(status=status_filter)

    rooms = query.order_by(Courtroom.id.asc()).all()
    return jsonify([r.to_dict() for r in rooms]), 200


# ── PUT /api/courtrooms/<id> ──────────────────────────────────────
@courtrooms_bp.route("/<int:room_id>", methods=["PUT"])
@jwt_required()
def update_courtroom(room_id):
    room = Courtroom.query.get(room_id)
    if not room:
        return jsonify({"error": "Courtroom not found"}), 404

    data = request.get_json()
    room.status = data.get("status", room.status)
    room.judge = data.get("judge", room.judge)
    room.current_case = data.get("currentCase", room.current_case)
    room.case_title = data.get("caseTitle", room.case_title)
    room.start_time = data.get("startTime", room.start_time)
    room.case_type = data.get("type", room.case_type)

    db.session.commit()
    return jsonify({"message": "Courtroom updated", "courtroom": room.to_dict()}), 200
