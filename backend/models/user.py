from models import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("public", "advocate", "court"), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    avatar = db.Column(db.String(255), nullable=True)

    # Public-specific
    citizen_id = db.Column(db.String(50), nullable=True)

    # Advocate-specific
    bar_council_id = db.Column(db.String(50), nullable=True)
    specialization = db.Column(db.String(100), nullable=True)
    experience = db.Column(db.String(50), nullable=True)
    rating = db.Column(db.Float, default=0.0)
    active_cases = db.Column(db.Integer, default=0)

    # Court-specific
    court_name = db.Column(db.String(200), nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    cases = db.relationship("Case", backref="advocate", lazy=True, foreign_keys="Case.advocate_id")
    documents = db.relationship("Document", backref="uploader", lazy=True)
    tasks = db.relationship("Task", backref="owner", lazy=True)
    notes = db.relationship("CaseNote", backref="author", lazy=True)
    notifications = db.relationship("Notification", backref="user", lazy=True)
    sent_messages = db.relationship("Message", backref="sender", lazy=True, foreign_keys="Message.sender_id")
    received_messages = db.relationship("Message", backref="receiver", lazy=True, foreign_keys="Message.receiver_id")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "avatar": self.avatar,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if self.role == "public":
            data["citizenId"] = self.citizen_id
        elif self.role == "advocate":
            data["barCouncilId"] = self.bar_council_id
            data["specialization"] = self.specialization
            data["experience"] = self.experience
            data["rating"] = self.rating
            data["activeCases"] = self.active_cases
        elif self.role == "court":
            data["courtName"] = self.court_name
        return data
