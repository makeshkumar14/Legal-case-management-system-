from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db
from models.user import User
from models.otp import OTPCode

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ═══════════════════════════════════════════════════════════════
#  CITIZEN (Public) — Aadhaar + OTP
# ═══════════════════════════════════════════════════════════════

@auth_bp.route("/citizen/register", methods=["POST"])
def citizen_register():
    """Register a new citizen with Aadhaar number and phone."""
    data = request.get_json()
    name = data.get("name", "").strip()
    aadhaar = data.get("aadhaarNumber", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not aadhaar or not phone:
        return jsonify({"error": "Name, Aadhaar number, and phone are required"}), 400

    if len(aadhaar) != 12 or not aadhaar.isdigit():
        return jsonify({"error": "Aadhaar number must be exactly 12 digits"}), 400

    if User.query.filter_by(aadhaar_number=aadhaar).first():
        return jsonify({"error": "This Aadhaar number is already registered"}), 409

    user = User(
        name=name,
        aadhaar_number=aadhaar,
        phone=phone,
        role="public",
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Citizen registered successfully. Please login with OTP."}), 201


@auth_bp.route("/citizen/send-otp", methods=["POST"])
def citizen_send_otp():
    """Generate and return OTP for a registered Aadhaar number (simulated)."""
    data = request.get_json()
    aadhaar = data.get("aadhaarNumber", "").strip()

    if not aadhaar or len(aadhaar) != 12 or not aadhaar.isdigit():
        return jsonify({"error": "Valid 12-digit Aadhaar number is required"}), 400

    user = User.query.filter_by(aadhaar_number=aadhaar, role="public").first()
    if not user:
        return jsonify({"error": "Aadhaar number not registered. Please sign up first."}), 404

    otp = OTPCode.generate_otp(aadhaar)

    # SIMULATED: In production, OTP would be sent via SMS to user.phone
    # For demo, we return it in the response
    return jsonify({
        "message": f"OTP sent to registered phone ending ****{user.phone[-4:] if user.phone else '****'}",
        "otp": otp,  # REMOVE IN PRODUCTION
    }), 200


@auth_bp.route("/citizen/verify-otp", methods=["POST"])
def citizen_verify_otp():
    """Verify OTP and return JWT token for citizen login."""
    data = request.get_json()
    aadhaar = data.get("aadhaarNumber", "").strip()
    otp = data.get("otp", "").strip()

    if not aadhaar or not otp:
        return jsonify({"error": "Aadhaar number and OTP are required"}), 400

    user = User.query.filter_by(aadhaar_number=aadhaar, role="public").first()
    if not user:
        return jsonify({"error": "Aadhaar number not registered"}), 404

    if not OTPCode.verify_otp(aadhaar, otp):
        return jsonify({"error": "Invalid or expired OTP"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════
#  ADVOCATE — Bar Council Registration Number + Password
# ═══════════════════════════════════════════════════════════════

@auth_bp.route("/advocate/register", methods=["POST"])
def advocate_register():
    """Register a new advocate."""
    data = request.get_json()
    name = data.get("name", "").strip()
    bar_council_id = data.get("barCouncilId", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    specialization = data.get("specialization", "").strip()
    password = data.get("password", "")

    if not name or not bar_council_id or not password:
        return jsonify({"error": "Name, Bar Council ID, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if User.query.filter_by(bar_council_id=bar_council_id).first():
        return jsonify({"error": "This Bar Council ID is already registered"}), 409

    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "This email is already registered"}), 409

    user = User(
        name=name,
        bar_council_id=bar_council_id,
        email=email or None,
        phone=phone or None,
        specialization=specialization or None,
        role="advocate",
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Advocate registered successfully. Please login."}), 201


@auth_bp.route("/advocate/login", methods=["POST"])
def advocate_login():
    """Login advocate with Bar Council ID and password."""
    data = request.get_json()
    bar_council_id = data.get("barCouncilId", "").strip()
    password = data.get("password", "")

    if not bar_council_id or not password:
        return jsonify({"error": "Bar Council ID and password are required"}), 400

    user = User.query.filter_by(bar_council_id=bar_council_id, role="advocate").first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid Bar Council ID or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════
#  COURT ADMIN — Pre-created Admin ID + Password
# ═══════════════════════════════════════════════════════════════

@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """Login court admin with Admin ID and password."""
    data = request.get_json()
    admin_id = data.get("adminId", "").strip()
    password = data.get("password", "")

    if not admin_id or not password:
        return jsonify({"error": "Admin ID and password are required"}), 400

    user = User.query.filter_by(admin_id=admin_id, role="court").first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid Admin ID or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════
#  PROFILE — Shared endpoints (JWT protected)
# ═══════════════════════════════════════════════════════════════

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    user.name = data.get("name", user.name)
    user.phone = data.get("phone", user.phone)
    user.avatar = data.get("avatar", user.avatar)

    if user.role == "advocate":
        user.specialization = data.get("specialization", user.specialization)
        user.experience = data.get("experience", user.experience)
    elif user.role == "court":
        user.court_name = data.get("courtName", user.court_name)

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200
