from models import db


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(300), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(10), default="medium")  # high, medium, low
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": f"TASK-{self.id:03d}",
            "caseId": self.case_id,
            "title": self.title,
            "completed": self.completed,
            "priority": self.priority,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
        }
