from flask import Blueprint, jsonify, request, session

from extensions import db
from models import Attendee, Event, TriviaQuestion, TriviaResponse, Vote

events_bp = Blueprint("events", __name__)

VALID_CATEGORIES = ["Workshop", "Concert", "Tech Event", "Social Event"]
POLL_LABELS = ["Keynote", "Workshop", "Networking", "Other"]


@events_bp.route("/api/events", methods=["GET"])
def list_events():
    events = Event.query.order_by(Event.id.asc()).all()
    data = []
    for event in events:
        data.append(
            {
                **event.to_dict(),
                "attendees": Attendee.query.filter_by(event_id=event.id).count(),
                "votes": Vote.query.filter_by(event_id=event.id).count(),
            }
        )
    return jsonify(data)


@events_bp.route("/api/events", methods=["POST"])
def create_event():
    user = session.get("user_id")
    if not user:
        return jsonify({"error": "Authentication required"}), 401
    from models import User
    organizer = User.query.get(user)
    if not organizer or organizer.role != "Planner":
        return jsonify({"error": "Only event organizers can create events"}), 403

    data = request.get_json(silent=True) or {}
    required = ["name", "date", "time", "location", "category"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"{missing[0]} is required"}), 400
    if data["category"] not in VALID_CATEGORIES:
        return jsonify({"error": "Invalid event category", "allowed_categories": VALID_CATEGORIES}), 400

    event = Event(
        name=data["name"],
        date=data["date"],
        time=data["time"],
        location=data["location"],
        category=data["category"],
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@events_bp.route("/api/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(
        {
            **event.to_dict(),
            "attendees": Attendee.query.filter_by(event_id=event.id).count(),
            "votes": Vote.query.filter_by(event_id=event.id).count(),
        }
    )




@events_bp.route("/api/attendees", methods=["POST"])
def create_attendee():
    data = request.get_json(silent=True) or {}
    event_id = data.get("event_id")
    name = (data.get("name") or "").strip()
    phone = (data.get("phone_number") or "").strip()
    email = (data.get("email") or "").strip() or None

    if not event_id or not name or not phone:
        return jsonify({"error": "event_id, name and phone_number are required"}), 400

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    existing = Attendee.query.filter_by(event_id=event.id, phone_number=phone).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    attendee = Attendee(
        event_id=event.id, name=name, phone_number=phone, email=email
    )
    db.session.add(attendee)
    db.session.commit()
    return jsonify(attendee.to_dict()), 201


@events_bp.route("/api/attendees", methods=["GET"])
def list_attendees():
    event_id = request.args.get("event_id", type=int)
    query = Attendee.query
    if event_id:
        query = query.filter_by(event_id=event_id)
    attendees = query.order_by(Attendee.registered_at.desc()).all()
    return jsonify({"total_attendees": len(attendees), "attendees": [a.to_dict() for a in attendees]})


@events_bp.route("/api/poll-results", methods=["GET"])
def poll_results():
    event_id = request.args.get("event_id", type=int)
    query = Vote.query
    if event_id:
        query = query.filter_by(event_id=event_id)
    votes = query.all()

    results = {label: 0 for label in POLL_LABELS}
    for vote in votes:
        if vote.choice in results:
            results[vote.choice] += 1

    return jsonify({"total_votes": len(votes), "results": results})


@events_bp.route("/api/dashboard/<int:event_id>", methods=["GET"])
def event_dashboard(event_id):
    event = Event.query.get_or_404(event_id)
    votes = Vote.query.filter_by(event_id=event.id).all()
    poll = {label: 0 for label in POLL_LABELS}
    for vote in votes:
        if vote.choice in poll:
            poll[vote.choice] += 1

    return jsonify(
        {
            "event": event.to_dict(),
            "attendees": {"total": Attendee.query.filter_by(event_id=event.id).count()},
            "poll": {"total_votes": len(votes), **poll},
        }
    )


@events_bp.route("/api/events/<int:event_id>/trivia", methods=["GET"])
def get_event_trivia(event_id):
    Event.query.get_or_404(event_id)
    questions = TriviaQuestion.query.filter_by(event_id=event_id).order_by(TriviaQuestion.id.asc()).all()
    return jsonify([q.to_dict() for q in questions])


@events_bp.route("/api/events/<int:event_id>/trivia", methods=["POST"])
def create_event_trivia(event_id):
    Event.query.get_or_404(event_id)
    data = request.get_json(silent=True) or {}
    if not data.get("question") or not data.get("options") or not isinstance(data.get("options"), list):
        return jsonify({"error": "question and options (list) are required"}), 400

    q = TriviaQuestion(
        event_id=event_id,
        question=data["question"],
        options=data["options"],
        correct_option_index=int(data.get("correct_option_index", 0)),
        airtime_reward=float(data.get("airtime_reward", 50.0)),
        difficulty=data.get("difficulty", "Medium"),
        explanation=data.get("explanation"),
    )
    db.session.add(q)
    db.session.commit()
    return jsonify(q.to_dict()), 201


@events_bp.route("/api/trivia/<int:question_id>", methods=["DELETE"])
def delete_trivia_question(question_id):
    q = TriviaQuestion.query.get_or_404(question_id)
    db.session.delete(q)
    db.session.commit()
    return jsonify({"success": True, "message": "Question deleted"}), 200


@events_bp.route("/api/trivia/<int:question_id>/results", methods=["GET"])
def trivia_question_results(question_id):
    question = TriviaQuestion.query.get_or_404(question_id)
    responses = TriviaResponse.query.filter_by(question_id=question.id).all()

    per_option = [0] * len(question.options)
    correct_count = 0
    for r in responses:
        if 0 <= r.chosen_index < len(per_option):
            per_option[r.chosen_index] += 1
        if r.is_correct:
            correct_count += 1

    return jsonify(
        {
            "question": question.to_dict(),
            "total_responses": len(responses),
            "correct_responses": correct_count,
            "per_option_counts": per_option,
        }
    )

