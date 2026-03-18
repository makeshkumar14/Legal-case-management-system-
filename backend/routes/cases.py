from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.case import Case, Hearing, CaseTimeline
from models.user import User
from datetime import date

cases_bp = Blueprint("cases", __name__, url_prefix="/api/cases")


# ── GET /api/cases ─────────────────────────────────────────────────
@cases_bp.route("", methods=["GET"])
@jwt_required()
def list_cases():
    user = User.query.get(int(get_jwt_identity()))
    status_filter = request.args.get("status")
    case_type = request.args.get("type")
    priority = request.args.get("priority")

    query = Case.query

    # Role-based filtering
    if user.role == "advocate":
        query = query.filter_by(advocate_id=user.id)
    elif user.role == "public":
        query = query.filter_by(petitioner=user.name)

    if status_filter:
        query = query.filter_by(status=status_filter)
    if case_type:
        query = query.filter_by(case_type=case_type)
    if priority:
        query = query.filter_by(priority=priority)

    cases = query.order_by(Case.created_at.desc()).all()
    return jsonify([c.to_dict() for c in cases]), 200


# ── GET /api/cases/<id> ────────────────────────────────────────────
@cases_bp.route("/<int:case_id>", methods=["GET"])
@jwt_required()
def get_case(case_id):
    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404
    return jsonify(case.to_dict(include_details=True)), 200


# ── POST /api/cases ────────────────────────────────────────────────
@cases_bp.route("", methods=["POST"])
@jwt_required()
def create_case():
    user = User.query.get(int(get_jwt_identity()))
    if user.role not in ("court", "advocate"):
        return jsonify({"error": "Only court/advocate can create cases"}), 403

    data = request.get_json()
    case = Case(
        case_number=data.get("caseNumber", f"CS/{date.today().year}/{Case.query.count() + 1:04d}"),
        title=data["title"],
        description=data.get("description", ""),
        case_type=data.get("caseType", "Civil"),
        status="filed",
        priority=data.get("priority", "medium"),
        petitioner=data.get("petitioner", ""),
        respondent=data.get("respondent", ""),
        advocate_id=data.get("advocateId"),
        judge=data.get("judge"),
        court_room_name=data.get("courtRoom"),
        filing_date=date.today(),
    )
    db.session.add(case)
    db.session.flush()

    # Add initial timeline entry
    timeline = CaseTimeline(
        case_id=case.id,
        date=date.today(),
        event="Case Filed",
        description="Case registered with Court Registry",
    )
    db.session.add(timeline)
    db.session.commit()

    return jsonify({"message": "Case created", "case": case.to_dict()}), 201


# ── PUT /api/cases/<id> ────────────────────────────────────────────
@cases_bp.route("/<int:case_id>", methods=["PUT"])
@jwt_required()
def update_case(case_id):
    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    data = request.get_json()
    case.title = data.get("title", case.title)
    case.description = data.get("description", case.description)
    case.status = data.get("status", case.status)
    case.priority = data.get("priority", case.priority)
    case.judge = data.get("judge", case.judge)
    case.court_room_name = data.get("courtRoom", case.court_room_name)
    case.advocate_id = data.get("advocateId", case.advocate_id)

    db.session.commit()
    return jsonify({"message": "Case updated", "case": case.to_dict()}), 200


# ── DELETE /api/cases/<id> ──────────────────────────────────────────
@cases_bp.route("/<int:case_id>", methods=["DELETE"])
@jwt_required()
def delete_case(case_id):
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "court":
        return jsonify({"error": "Only court can delete cases"}), 403

    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    db.session.delete(case)
    db.session.commit()
    return jsonify({"message": "Case deleted"}), 200


# ── GET /api/cases/search ──────────────────────────────────────────
@cases_bp.route("/search", methods=["GET"])
@jwt_required()
def search_cases():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([]), 200

    results = Case.query.filter(
        db.or_(
            Case.case_number.ilike(f"%{q}%"),
            Case.title.ilike(f"%{q}%"),
            Case.petitioner.ilike(f"%{q}%"),
            Case.respondent.ilike(f"%{q}%"),
            Case.case_type.ilike(f"%{q}%"),
        )
    ).limit(20).all()

    return jsonify([c.to_dict() for c in results]), 200


# ── GET /api/cases/qr/<case_number> ────────────────────────────────
@cases_bp.route("/qr/<case_number>", methods=["GET"])
@jwt_required()
def qr_lookup(case_number):
    case = Case.query.filter_by(case_number=case_number).first()
    if not case:
        return jsonify({"error": "Case not found"}), 404
    return jsonify(case.to_dict(include_details=True)), 200
