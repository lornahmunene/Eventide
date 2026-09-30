from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/register", methods=["POST"])
def register_account():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role") or "Attendee"
    phone = (data.get("phone_number") or "").strip() or None

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400
    if role not in {"Attendee", "Vendor", "Planner"}:
        return jsonify({"error": "Invalid account role"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    user = User(
        name=name, email=email, role=role, phone_number=phone,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify(user.to_dict()), 201


@auth_bp.route("/api/auth/login", methods=["POST"])
def login_account():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
    session["user_id"] = user.id
    return jsonify(user.to_dict()), 200


@auth_bp.route("/api/auth/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user.to_dict()), 200


@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout_account():
    session.clear()
    return jsonify({"success": True}), 200
