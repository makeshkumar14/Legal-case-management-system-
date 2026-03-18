import os
import sys
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_bcrypt import Bcrypt

from config import Config
from models import db
from models.user import User
from models.case import Case, Hearing, CaseTimeline
from models.document import Document
from models.task import Task
from models.case_note import CaseNote
from models.notification import Notification
from models.message import Message
from models.courtroom import Courtroom


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── Initialize Extensions ──────────────────────────────────────
    db.init_app(app)
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
    jwt = JWTManager(app)
    mail = Mail(app)
    bcrypt = Bcrypt(app)

    # Make uploads folder
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)

    # ── Register Blueprints ────────────────────────────────────────
    from routes.auth import auth_bp
    from routes.cases import cases_bp
    from routes.hearings import hearings_bp
    from routes.documents import documents_bp
    from routes.tasks import tasks_bp
    from routes.notes import notes_bp
    from routes.notifications import notifications_bp, init_mail
    from routes.messages import messages_bp
    from routes.courtrooms import courtrooms_bp
    from routes.analytics import analytics_bp

    # Pass mail instance to notifications module
    init_mail(mail)

    app.register_blueprint(auth_bp)
    app.register_blueprint(cases_bp)
    app.register_blueprint(hearings_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(courtrooms_bp)
    app.register_blueprint(analytics_bp)

    # ── Health Check ───────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok", "message": "Legal CMS API is running"}, 200

    # ── Create Tables ──────────────────────────────────────────────
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
