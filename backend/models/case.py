from models import db


class Case(db.Model):
    __tablename__ = "cases"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    case_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, nullable=True)
    case_type = db.Column(db.String(50), nullable=False)  # Civil, Criminal, Family, Consumer, Writ, Motor Accident
    status = db.Column(
        db.String(30),
        default="filed",
    )  # filed, under_review, hearing_scheduled, in_progress, judgment_reserved, closed, dismissed
    priority = db.Column(db.String(10), default="medium")  # high, medium, low
    petitioner = db.Column(db.String(200), nullable=False)
    respondent = db.Column(db.String(200), nullable=False)
    advocate_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    judge = db.Column(db.String(200), nullable=True)
    courtroom_id = db.Column(db.Integer, db.ForeignKey("courtrooms.id"), nullable=True)
    court_room_name = db.Column(db.String(100), nullable=True)
    next_hearing = db.Column(db.DateTime, nullable=True)
    filing_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    hearings = db.relationship("Hearing", backref="case", lazy=True, cascade="all, delete-orphan")
    timeline = db.relationship("CaseTimeline", backref="case", lazy=True, cascade="all, delete-orphan")
    documents = db.relationship("Document", backref="case", lazy=True, cascade="all, delete-orphan")
    tasks = db.relationship("Task", backref="case", lazy=True, cascade="all, delete-orphan")
    notes = db.relationship("CaseNote", backref="case", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_details=False):
        data = {
            "id": f"CASE-{self.filing_date.year}-{self.id:03d}" if self.filing_date else str(self.id),
            "caseNumber": self.case_number,
            "title": self.title,
            "description": self.description,
            "caseType": self.case_type,
            "status": self.status,
            "priority": self.priority,
            "petitioner": self.petitioner,
            "respondent": self.respondent,
            "judge": self.judge,
            "courtRoom": self.court_room_name,
            "nextHearing": self.next_hearing.isoformat() if self.next_hearing else None,
            "filingDate": self.filing_date.isoformat() if self.filing_date else None,
        }
        if self.advocate:
            data["advocate"] = {
                "id": self.advocate.id,
                "name": self.advocate.name,
                "email": self.advocate.email,
            }
        if include_details:
            data["hearings"] = [h.to_dict() for h in self.hearings]
            data["timeline"] = [t.to_dict() for t in self.timeline]
        return data


class Hearing(db.Model):
    __tablename__ = "hearings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default="scheduled")  # scheduled, completed
    notes = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "caseId": self.case_id,
            "date": self.date.isoformat() if self.date else None,
            "type": self.type,
            "status": self.status,
            "notes": self.notes or "",
            "location": self.location,
            "court": self.location,
            "startTime": self.start_time.isoformat() if self.start_time else None,
            "endTime": self.end_time.isoformat() if self.end_time else None,
        }

    def to_calendar_event(self):
        case = self.case
        return {
            "id": f"EVT-{self.id:03d}",
            "title": f"{case.title}" if case else self.type,
            "start": self.start_time.isoformat() if self.start_time else self.date.isoformat(),
            "end": self.end_time.isoformat() if self.end_time else None,
            "type": "hearing",
            "caseId": self.case_id,
            "location": self.location,
        }


class CaseTimeline(db.Model):
    __tablename__ = "case_timeline"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    event = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "date": self.date.isoformat() if self.date else None,
            "event": self.event,
            "description": self.description or "",
        }
