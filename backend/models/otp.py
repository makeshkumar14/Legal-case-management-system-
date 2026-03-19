from models import db
from datetime import datetime, timedelta


class OTPCode(db.Model):
    __tablename__ = "otp_codes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    aadhaar = db.Column(db.String(12), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    @staticmethod
    def generate_otp(aadhaar):
        """Generate a 6-digit OTP, invalidate old ones, and save."""
        import random

        # Mark all previous OTPs for this aadhaar as used
        OTPCode.query.filter_by(aadhaar=aadhaar, used=False).update({"used": True})

        otp = str(random.randint(100000, 999999))
        otp_record = OTPCode(
            aadhaar=aadhaar,
            otp_code=otp,
            expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
        db.session.add(otp_record)
        db.session.commit()
        return otp

    @staticmethod
    def verify_otp(aadhaar, otp_code):
        """Verify the OTP for an aadhaar number. Returns True if valid."""
        record = (
            OTPCode.query.filter_by(aadhaar=aadhaar, otp_code=otp_code, used=False)
            .order_by(OTPCode.created_at.desc())
            .first()
        )
        if not record:
            return False
        if record.expires_at < datetime.utcnow():
            return False

        record.used = True
        db.session.commit()
        return True
