from models import db


class Courtroom(db.Model):
    __tablename__ = "courtrooms"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    judge = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="available")  # in_session, available, recess, closed
    current_case = db.Column(db.String(50), nullable=True)
    case_title = db.Column(db.String(300), nullable=True)
    start_time = db.Column(db.String(20), nullable=True)
    case_type = db.Column(db.String(50), nullable=True)

    # Relationship
    cases = db.relationship("Case", backref="courtroom", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "judge": self.judge,
            "status": self.status,
            "currentCase": self.current_case,
            "caseTitle": self.case_title,
            "startTime": self.start_time,
            "type": self.case_type,
        }
