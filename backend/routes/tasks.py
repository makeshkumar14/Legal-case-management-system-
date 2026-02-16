from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.task import Task
from datetime import datetime

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


# ── GET /api/tasks ─────────────────────────────────────────────────
@tasks_bp.route("", methods=["GET"])
@jwt_required()
def list_tasks():
    user_id = int(get_jwt_identity())
    case_id = request.args.get("case_id", type=int)

    query = Task.query.filter_by(user_id=user_id)
    if case_id:
        query = query.filter_by(case_id=case_id)

    tasks = query.order_by(Task.due_date.asc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


# ── POST /api/tasks ────────────────────────────────────────────────
@tasks_bp.route("", methods=["POST"])
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    task = Task(
        case_id=data["caseId"],
        user_id=user_id,
        title=data["title"],
        priority=data.get("priority", "medium"),
        due_date=datetime.strptime(data["dueDate"], "%Y-%m-%d").date() if data.get("dueDate") else None,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"message": "Task created", "task": task.to_dict()}), 201


# ── PUT /api/tasks/<id> ────────────────────────────────────────────
@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    task.title = data.get("title", task.title)
    task.completed = data.get("completed", task.completed)
    task.priority = data.get("priority", task.priority)
    if data.get("dueDate"):
        task.due_date = datetime.strptime(data["dueDate"], "%Y-%m-%d").date()

    db.session.commit()
    return jsonify({"message": "Task updated", "task": task.to_dict()}), 200


# ── DELETE /api/tasks/<id> ──────────────────────────────────────────
@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200
