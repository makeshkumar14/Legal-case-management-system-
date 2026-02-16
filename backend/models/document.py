from models import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(300), nullable=False)
    doc_type = db.Column(db.String(50), default="Document")  # Document, Image, Video
    file_type = db.Column(db.String(10), nullable=False)  # pdf, jpg, mp4
    file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.String(20), nullable=True)
    verified = db.Column(db.Boolean, default=False)
    uploaded_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": f"EVD-{self.id:03d}",
            "caseId": self.case_id,
            "title": self.title,
            "type": self.doc_type,
            "fileType": self.file_type,
            "filePath": self.file_path,
            "fileSize": self.file_size,
            "size": self.file_size,
            "verified": self.verified,
            "status": "verified" if self.verified else "pending",
            "uploadedBy": self.uploader.name if self.uploader else None,
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
