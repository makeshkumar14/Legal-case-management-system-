from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_, func
from models import db
from models.message import Message
from models.user import User

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")


# ── GET /api/messages/contacts ─────────────────────────────────────
@messages_bp.route("/contacts", methods=["GET"])
@jwt_required()
def list_contacts():
    user_id = int(get_jwt_identity())

    # Find all users this person has exchanged messages with
    contact_ids_sent = db.session.query(Message.receiver_id).filter_by(sender_id=user_id).distinct()
    contact_ids_recv = db.session.query(Message.sender_id).filter_by(receiver_id=user_id).distinct()
    contact_ids = set([r[0] for r in contact_ids_sent] + [r[0] for r in contact_ids_recv])

    # If no conversations yet, return all other users as potential contacts
    if not contact_ids:
        users = User.query.filter(User.id != user_id).all()
    else:
        users = User.query.filter(User.id.in_(contact_ids)).all()

    contacts = []
    for u in users:
        # Get last message
        last_msg = Message.query.filter(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == u.id),
                and_(Message.sender_id == u.id, Message.receiver_id == user_id),
            )
        ).order_by(Message.sent_at.desc()).first()

        # Count unread
        unread = Message.query.filter_by(sender_id=u.id, receiver_id=user_id, is_read=False).count()

        contacts.append({
            "id": u.id,
            "name": u.name,
            "role": u.role.capitalize(),
            "email": u.email,
            "online": False,  # Would need WebSocket for real online status
            "lastMsg": last_msg.content[:50] if last_msg else "",
            "time": last_msg.sent_at.strftime("%I:%M %p") if last_msg else "",
            "unread": unread,
        })

    # Sort by most recent message
    contacts.sort(key=lambda c: c["time"], reverse=True)
    return jsonify(contacts), 200


# ── GET /api/messages/<contact_id> ─────────────────────────────────
@messages_bp.route("/<int:contact_id>", methods=["GET"])
@jwt_required()
def get_conversation(contact_id):
    user_id = int(get_jwt_identity())

    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == contact_id),
            and_(Message.sender_id == contact_id, Message.receiver_id == user_id),
        )
    ).order_by(Message.sent_at.asc()).all()

    # Mark received messages as read
    Message.query.filter_by(sender_id=contact_id, receiver_id=user_id, is_read=False).update(
        {"is_read": True}
    )
    db.session.commit()

    return jsonify([m.to_dict_for_user(user_id) for m in messages]), 200


# ── POST /api/messages ─────────────────────────────────────────────
@messages_bp.route("", methods=["POST"])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data.get("receiverId") or not data.get("content"):
        return jsonify({"error": "receiverId and content are required"}), 400

    msg = Message(
        sender_id=user_id,
        receiver_id=data["receiverId"],
        content=data["content"],
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({"message": "Message sent", "data": msg.to_dict_for_user(user_id)}), 201
