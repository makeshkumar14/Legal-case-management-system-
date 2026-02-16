from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from models import db
from models.case import Case, Hearing
from models.user import User
from models.document import Document
from models.task import Task
from datetime import date, datetime, timedelta

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


# ── GET /api/analytics/dashboard ───────────────────────────────────
@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard_stats():
    user = User.query.get(int(get_jwt_identity()))

    if user.role == "court":
        total = Case.query.count()
        pending = Case.query.filter(Case.status.in_(["filed", "under_review", "hearing_scheduled", "in_progress"])).count()
        closed = Case.query.filter_by(status="closed").count()
        dismissed = Case.query.filter_by(status="dismissed").count()
        today_hearings = Hearing.query.filter_by(date=date.today()).count()
        advocates_count = User.query.filter_by(role="advocate").count()

        return jsonify({
            "totalCases": total,
            "pendingCases": pending,
            "closedCases": closed,
            "dismissedCases": dismissed,
            "todayHearings": today_hearings,
            "advocatesCount": advocates_count,
        }), 200

    elif user.role == "advocate":
        active = Case.query.filter_by(advocate_id=user.id).filter(
            Case.status.in_(["filed", "under_review", "hearing_scheduled", "in_progress"])
        ).count()
        today_hearings = Hearing.query.join(Case).filter(
            Case.advocate_id == user.id, Hearing.date == date.today()
        ).count()
        pending_tasks = Task.query.filter_by(user_id=user.id, completed=False).count()
        evidence_count = Document.query.join(Case).filter(Case.advocate_id == user.id).count()

        return jsonify({
            "activeCases": active,
            "todayHearings": today_hearings,
            "pendingTasks": pending_tasks,
            "evidenceCount": evidence_count,
        }), 200

    else:  # public
        my_cases = Case.query.filter_by(petitioner=user.name).count()
        next_hearing = Hearing.query.join(Case).filter(
            Case.petitioner == user.name, Hearing.date >= date.today()
        ).order_by(Hearing.date.asc()).first()
        docs = Document.query.join(Case).filter(Case.petitioner == user.name).count()

        return jsonify({
            "activeCases": my_cases,
            "nextHearing": next_hearing.to_dict() if next_hearing else None,
            "documents": docs,
        }), 200


# ── GET /api/analytics/cases-trend ─────────────────────────────────
@analytics_bp.route("/cases-trend", methods=["GET"])
@jwt_required()
def cases_trend():
    months = []
    for i in range(6, -1, -1):
        d = date.today().replace(day=1) - timedelta(days=i * 30)
        month_name = d.strftime("%b")
        filed = Case.query.filter(
            extract("year", Case.filing_date) == d.year,
            extract("month", Case.filing_date) == d.month,
        ).count()
        closed = Case.query.filter(
            Case.status == "closed",
            extract("year", Case.filing_date) == d.year,
            extract("month", Case.filing_date) == d.month,
        ).count()
        months.append({"month": month_name, "filed": filed, "closed": closed})

    return jsonify(months), 200


# ── GET /api/analytics/cases-by-type ───────────────────────────────
@analytics_bp.route("/cases-by-type", methods=["GET"])
@jwt_required()
def cases_by_type():
    type_colors = {
        "Civil": "#4f46e5",
        "Criminal": "#ef4444",
        "Family": "#f59e0b",
        "Consumer": "#10b981",
        "Writ": "#8b5cf6",
    }

    results = db.session.query(
        Case.case_type, func.count(Case.id)
    ).group_by(Case.case_type).all()

    data = []
    for case_type, count in results:
        data.append({
            "name": case_type,
            "value": count,
            "color": type_colors.get(case_type, "#64748b"),
        })

    return jsonify(data), 200


# ── GET /api/analytics/daily-hearings ──────────────────────────────
@analytics_bp.route("/daily-hearings", methods=["GET"])
@jwt_required()
def daily_hearings():
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    data = []
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())

    for i, day_name in enumerate(days):
        d = start_of_week + timedelta(days=i)
        count = Hearing.query.filter_by(date=d).count()
        data.append({"day": day_name, "count": count})

    return jsonify(data), 200


# ── GET /api/analytics/advocate-performance ────────────────────────
@analytics_bp.route("/advocate-performance", methods=["GET"])
@jwt_required()
def advocate_performance():
    user = User.query.get(int(get_jwt_identity()))

    total_cases = Case.query.filter_by(advocate_id=user.id).count()
    won = Case.query.filter_by(advocate_id=user.id, status="closed").count()
    active = Case.query.filter_by(advocate_id=user.id).filter(
        Case.status.in_(["filed", "under_review", "hearing_scheduled", "in_progress"])
    ).count()

    win_rate = round((won / total_cases * 100), 1) if total_cases > 0 else 0

    # Performance by case type
    specializations = db.session.query(
        Case.case_type, func.count(Case.id)
    ).filter_by(advocate_id=user.id).group_by(Case.case_type).all()

    spec_data = []
    for case_type, count in specializations:
        wins = Case.query.filter_by(advocate_id=user.id, case_type=case_type, status="closed").count()
        rate = round((wins / count * 100)) if count > 0 else 0
        spec_data.append({
            "type": case_type,
            "cases": count,
            "wins": wins,
            "rate": f"{rate}%",
        })

    return jsonify({
        "totalCases": total_cases,
        "winRate": f"{win_rate}%",
        "activeCases": active,
        "specializations": spec_data,
    }), 200


# ── GET /api/analytics/pendency ────────────────────────────────────
@analytics_bp.route("/pendency", methods=["GET"])
@jwt_required()
def pendency_report():
    months = []
    for i in range(11, -1, -1):
        d = date.today().replace(day=1) - timedelta(days=i * 30)
        month_name = d.strftime("%b")
        pending = Case.query.filter(
            Case.filing_date <= d,
            Case.status.in_(["filed", "under_review", "hearing_scheduled", "in_progress", "judgment_reserved"]),
        ).count()
        months.append({"month": month_name, "pending": pending})

    return jsonify(months), 200
