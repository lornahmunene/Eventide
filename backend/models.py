from datetime import datetime

from extensions import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="Attendee")
    phone_number = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone_number": self.phone_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Event(db.Model):
    __tablename__ = "events"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Tech Event")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "date": self.date,
            "time": self.time,
            "location": self.location,
        }


class Attendee(db.Model):
    __tablename__ = "attendees"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    checked_in = db.Column(db.Boolean, default=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "phone_number": self.phone_number,
            "registered_at": self.registered_at.isoformat(),
        }


class Reminder(db.Model):
    __tablename__ = "reminders"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"))
    message = db.Column(db.String(500))
    scheduled_time = db.Column(db.DateTime)
    sent = db.Column(db.Boolean, default=False)


class Vote(db.Model):
    """Live-poll votes cast over USSD (see ussd_routes.py)."""

    __tablename__ = "votes"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    choice = db.Column(db.String(100), nullable=False)
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)


class AirtimeReward(db.Model):
    __tablename__ = "airtime_rewards"
    id = db.Column(db.Integer, primary_key=True)
    attendee_id = db.Column(db.Integer, db.ForeignKey("attendees.id"))
    amount = db.Column(db.Float)
    reason = db.Column(db.String(200))
    status = db.Column(db.String(20), default="pending")


class Vendor(db.Model):
    __tablename__ = "vendors"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"))
    name = db.Column(db.String(120), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(80))
    # pending -> confirmed | issue, updated automatically from inbound SMS
    status = db.Column(db.String(20), default="pending")

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "phone_number": self.phone_number,
            "category": self.category,
            "status": self.status,
        }


class VendorMessage(db.Model):
    __tablename__ = "vendor_messages"
    id = db.Column(db.Integer, primary_key=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey("vendors.id"))
    message = db.Column(db.String(500))
    direction = db.Column(db.String(10))  # "outbound" or "inbound"
    status = db.Column(db.String(30), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "vendor_id": self.vendor_id,
            "message": self.message,
            "direction": self.direction,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }


class TriviaResponse(db.Model):
    """One attendee's answer to one trivia question, submitted over USSD."""

    __tablename__ = "trivia_responses"
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("trivia_questions.id"), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    chosen_index = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "question_id": self.question_id,
            "phone_number": self.phone_number,
            "chosen_index": self.chosen_index,
            "is_correct": self.is_correct,
            "answered_at": self.answered_at.isoformat() if self.answered_at else None,
        }


class TriviaQuestion(db.Model):
    """Trivia questions formulated by event organisers."""

    __tablename__ = "trivia_questions"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    question = db.Column(db.String(500), nullable=False)
    options = db.Column(db.JSON, nullable=False)  # e.g. ["Choice A", "Choice B", "Choice C", "Choice D"]
    correct_option_index = db.Column(db.Integer, nullable=False, default=0)
    airtime_reward = db.Column(db.Float, default=50.0)
    difficulty = db.Column(db.String(20), default="Medium")
    explanation = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "question": self.question,
            "options": self.options,
            "correct_option_index": self.correct_option_index,
            "airtime_reward": self.airtime_reward,
            "difficulty": self.difficulty,
            "explanation": self.explanation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }