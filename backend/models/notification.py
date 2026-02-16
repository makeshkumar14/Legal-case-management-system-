from models import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    type = db.Column(db.String(30), default="system")  # hearing, update, document, reminder, system
    title = db.Column(db.String(300), nullable=False)
    message = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(10), default="low")  # high, medium, low
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": f"NOT-{self.id:03d}",
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "priority": self.priority,
            "read": self.is_read,
            "time": self.created_at.strftime("%Y-%m-%dT%H:%M:%S") if self.created_at else None,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }
