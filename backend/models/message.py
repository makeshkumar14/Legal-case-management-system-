from models import db


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "senderId": self.sender_id,
            "receiverId": self.receiver_id,
            "text": self.content,
            "from": "me" if hasattr(self, "_current_user_id") and self.sender_id == self._current_user_id else "them",
            "time": self.sent_at.strftime("%I:%M %p") if self.sent_at else None,
            "isRead": self.is_read,
        }

    def to_dict_for_user(self, current_user_id):
        return {
            "id": self.id,
            "senderId": self.sender_id,
            "receiverId": self.receiver_id,
            "text": self.content,
            "from": "me" if self.sender_id == current_user_id else "them",
            "time": self.sent_at.strftime("%I:%M %p") if self.sent_at else None,
            "isRead": self.is_read,
        }
