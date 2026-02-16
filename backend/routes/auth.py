from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db
from models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── POST /api/auth/register ────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password") or not data.get("name"):
        return jsonify({"error": "Name, email, and password are required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        name=data["name"],
        email=data["email"],
        role=data.get("role", "public"),
        phone=data.get("phone"),
        citizen_id=data.get("citizenId"),
        bar_council_id=data.get("barCouncilId"),
        specialization=data.get("specialization"),
        experience=data.get("experience"),
        court_name=data.get("courtName"),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "User registered", "token": token, "user": user.to_dict()}), 201


# ── POST /api/auth/login ───────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


# ── GET /api/auth/profile ──────────────────────────────────────────
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


# ── PUT /api/auth/profile ──────────────────────────────────────────
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


# ── PUT /api/auth/change-password ──────────────────────────────────
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if not data.get("currentPassword") or not data.get("newPassword"):
        return jsonify({"error": "Current and new password required"}), 400

    if not user.check_password(data["currentPassword"]):
        return jsonify({"error": "Current password is incorrect"}), 401

    user.set_password(data["newPassword"])
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200
