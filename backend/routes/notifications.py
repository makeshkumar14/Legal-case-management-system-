from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message as MailMessage
from models import db
from models.notification import Notification

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

# Flask-Mail instance will be set from app.py
mail = None


def init_mail(mail_instance):
    global mail
    mail = mail_instance


# ── GET /api/notifications ─────────────────────────────────────────
@notifications_bp.route("", methods=["GET"])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).all()
    return jsonify([n.to_dict() for n in notifs]), 200


# ── PUT /api/notifications/<id>/read ───────────────────────────────
@notifications_bp.route("/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    notif = Notification.query.get(notif_id)
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


# ── DELETE /api/notifications/<id> ─────────────────────────────────
@notifications_bp.route("/<int:notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    notif = Notification.query.get(notif_id)
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200


# ── POST /api/notifications/send-email ─────────────────────────────
@notifications_bp.route("/send-email", methods=["POST"])
@jwt_required()
def send_email_notification():
    """Send an email notification using Flask-Mail."""
    data = request.get_json()
    if not data.get("to") or not data.get("subject") or not data.get("body"):
        return jsonify({"error": "to, subject, and body are required"}), 400

    if mail is None:
        return jsonify({"error": "Mail service not configured"}), 503

    try:
        msg = MailMessage(
            subject=data["subject"],
            recipients=[data["to"]],
            body=data["body"],
        )
        mail.send(msg)
        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500
