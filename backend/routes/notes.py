from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.case_note import CaseNote

notes_bp = Blueprint("notes", __name__, url_prefix="/api/notes")


# ── GET /api/notes ─────────────────────────────────────────────────
@notes_bp.route("", methods=["GET"])
@jwt_required()
def list_notes():
    case_id = request.args.get("case_id", type=int)
    user_id = int(get_jwt_identity())

    query = CaseNote.query.filter_by(user_id=user_id)
    if case_id:
        query = query.filter_by(case_id=case_id)

    notes = query.order_by(CaseNote.updated_at.desc()).all()
    return jsonify([n.to_dict() for n in notes]), 200


# ── POST /api/notes ────────────────────────────────────────────────
@notes_bp.route("", methods=["POST"])
@jwt_required()
def create_note():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    note = CaseNote(
        case_id=data["caseId"],
        user_id=user_id,
        content=data["content"],
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({"message": "Note created", "note": note.to_dict()}), 201


# ── PUT /api/notes/<id> ────────────────────────────────────────────
@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_note(note_id):
    note = CaseNote.query.get(note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.get_json()
    note.content = data.get("content", note.content)
    db.session.commit()
    return jsonify({"message": "Note updated", "note": note.to_dict()}), 200


# ── DELETE /api/notes/<id> ──────────────────────────────────────────
@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    note = CaseNote.query.get(note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Note deleted"}), 200
