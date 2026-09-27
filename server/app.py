from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# =========================================================
# DATABASE CONFIGURATION
# =========================================================

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///eventflow.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# =========================================================
# EVENT MODEL
# =========================================================

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    category = db.Column(
        db.String(50),
        nullable=False,
        default="Tech Event"
    )


# =========================================================
# ATTENDEE MODEL
# =========================================================

class Attendee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    registered_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
    event_id = db.Column(
        db.Integer,
        db.ForeignKey("event.id"),
        nullable=False
    )


# =========================================================
# VOTE MODEL
# =========================================================

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    choice = db.Column(db.String(100), nullable=False)
    voted_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
    event_id = db.Column(
        db.Integer,
        db.ForeignKey("event.id"),
        nullable=False
    )


# =========================================================
# CREATE DATABASE
# =========================================================

with app.app_context():

    db.create_all()

    # Create first event if database has no events
    if Event.query.count() == 0:

        event = Event(
            name="Africa's Talking Event",
            date="30 September 2026",
            time="8:30 AM - 6:30 PM",
            location="Africa's Talking Ltd., Kabarsiran Ave, Nairobi",
            category="Tech Event"
        )

        db.session.add(event)
        db.session.commit()


# =========================================================
# USSD
# =========================================================

@app.route("/ussd", methods=["POST"])
def ussd():

    text = request.form.get("text", "")

    parts = text.split("*") if text else []


    # =====================================================
    # STEP 1: CHOOSE EVENT CATEGORY
    # =====================================================

    if text == "":

        return """CON WELCOME TO EVENTFLOW

What type of event?

1. Workshop
2. Concert
3. Tech Event
4. Social Event"""


    # =====================================================
    # EVENT CATEGORIES
    # =====================================================

    categories = {
        "1": "Workshop",
        "2": "Concert",
        "3": "Tech Event",
        "4": "Social Event"
    }


    # =====================================================
    # STEP 2: USER CHOOSES CATEGORY
    # =====================================================

    if len(parts) == 1:

        category_number = parts[0]

        if category_number not in categories:

            return """END Invalid event category.

Please try again."""

        category = categories[category_number]

        events = Event.query.filter_by(
            category=category
        ).order_by(
            Event.id.asc()
        ).all()


        # No events in that category

        if not events:

            return f"""END No {category} events are currently available.

Please try again later."""


        response = f"CON {category.upper()} EVENTS\n\n"


        for index, event in enumerate(events, start=1):

            response += f"{index}. {event.name}\n"


        return response


    # =====================================================
    # STEP 3: USER CHOOSES EVENT
    # =====================================================

    if len(parts) == 2:

        category_number = parts[0]
        event_number = parts[1]


        if category_number not in categories:

            return """END Invalid event category.

Please try again."""


        try:

            event_number = int(event_number)

        except ValueError:

            return """END Invalid event selection.

Please try again."""


        category = categories[category_number]


        events = Event.query.filter_by(
            category=category
        ).order_by(
            Event.id.asc()
        ).all()


        if event_number < 1 or event_number > len(events):

            return """END Invalid event selection.

Please try again."""


        event = events[event_number - 1]


        return f"""CON {event.name}

1. Register
2. Event Information
3. Live Poll
4. Programme"""


    # =====================================================
    # GET SELECTED EVENT
    # =====================================================

    category_number = parts[0]
    event_number = parts[1]


    if category_number not in categories:

        return """END Invalid event category."""


    try:

        event_number = int(event_number)

    except ValueError:

        return """END Invalid event selection."""


    category = categories[category_number]


    events = Event.query.filter_by(
        category=category
    ).order_by(
        Event.id.asc()
    ).all()


    if event_number < 1 or event_number > len(events):

        return """END Invalid event selection."""


    event = events[event_number - 1]


    # =====================================================
    # STEP 4: EVENT MENU
    # =====================================================

    if len(parts) == 3:

        option = parts[2]


        # -------------------------------------------------
        # REGISTER
        # -------------------------------------------------

        if option == "1":

            return """CON EVENT REGISTRATION

Enter your name:"""


        # -------------------------------------------------
        # EVENT INFORMATION
        # -------------------------------------------------

        elif option == "2":

            return f"""CON EVENT INFORMATION

{event.name}

1. Date & Time
2. Location
3. Back"""


        # -------------------------------------------------
        # LIVE POLL
        # -------------------------------------------------

        elif option == "3":

            return """CON LIVE POLL

What was your favourite session?

1. Keynote
2. Workshop
3. Networking
4. Other"""


        # -------------------------------------------------
        # PROGRAMME
        # -------------------------------------------------

        elif option == "4":

            return """CON EVENT PROGRAMME

1. Opening
2. Keynote
3. Networking
4. Closing"""


        else:

            return """END Invalid option.

Please try again."""


    # =====================================================
    # REGISTRATION
    # =====================================================

    if parts[2] == "1":


        # User entered name

        if len(parts) == 4:

            name = parts[3]


            return f"""CON Hello {name}!

Enter your phone number:"""


        # User entered phone

        elif len(parts) == 5:

            name = parts[3]
            phone = parts[4]


            attendee = Attendee(
                name=name,
                phone=phone,
                event_id=event.id
            )


            db.session.add(attendee)
            db.session.commit()


            return f"""END REGISTRATION SUCCESSFUL!

Event: {event.name}

Name: {name}

Phone: {phone}

Thank you for registering."""


    # =====================================================
    # EVENT INFORMATION
    # =====================================================

    if parts[2] == "2":

        if len(parts) == 4:


            # Date and time

            if parts[3] == "1":

                return f"""END DATE & TIME

{event.date}

{event.time}"""


            # Location

            elif parts[3] == "2":

                return f"""END LOCATION

{event.location}"""


            # Back to event menu

            elif parts[3] == "3":

                return f"""CON {event.name}

1. Register
2. Event Information
3. Live Poll
4. Programme"""


    # =====================================================
    # LIVE POLL
    # =====================================================

    if parts[2] == "3":


        choices = {

            "1": "Keynote",

            "2": "Workshop",

            "3": "Networking",

            "4": "Other"

        }


        if len(parts) == 4 and parts[3] in choices:

            choice = choices[parts[3]]


            vote = Vote(

                choice=choice,

                event_id=event.id

            )


            db.session.add(vote)

            db.session.commit()


            return f"""END THANK YOU FOR VOTING!

Your choice: {choice}

Your vote has been recorded."""


    # =====================================================
    # PROGRAMME
    # =====================================================

    if parts[2] == "4":

        if len(parts) == 4:


            if parts[3] == "1":

                return """END OPENING

8:30 AM - 9:00 AM

Registration and Welcome"""


            elif parts[3] == "2":

                return """END KEYNOTE

10:00 AM - 11:00 AM

Main Keynote Session"""


            elif parts[3] == "3":

                return """END NETWORKING

2:00 PM - 3:30 PM

Networking and Collaboration"""


            elif parts[3] == "4":

                return """END CLOSING

5:30 PM - 6:30 PM

Closing Remarks and Awards"""


    # =====================================================
    # INVALID OPTION
    # =====================================================

    return """END Invalid option.

Please try again."""


# =========================================================
# GET ALL EVENTS
# =========================================================

@app.route("/api/events", methods=["GET"])
def get_events():

    events = Event.query.order_by(
        Event.id.asc()
    ).all()


    data = []


    for event in events:

        attendee_count = Attendee.query.filter_by(
            event_id=event.id
        ).count()


        vote_count = Vote.query.filter_by(
            event_id=event.id
        ).count()


        data.append({

            "id": event.id,

            "name": event.name,

            "category": event.category,

            "date": event.date,

            "time": event.time,

            "location": event.location,

            "attendees": attendee_count,

            "votes": vote_count

        })


    return jsonify(data)


# =========================================================
# CREATE EVENT
# =========================================================

@app.route("/api/events", methods=["POST"])
def create_event():

    data = request.get_json()


    if not data:

        return jsonify({
            "error": "No event data provided"
        }), 400


    required_fields = [
        "name",
        "date",
        "time",
        "location",
        "category"
    ]


    for field in required_fields:

        if field not in data or not data[field]:

            return jsonify({
                "error": f"{field} is required"
            }), 400


    valid_categories = [
        "Workshop",
        "Concert",
        "Tech Event",
        "Social Event"
    ]


    if data["category"] not in valid_categories:

        return jsonify({
            "error": "Invalid event category",
            "allowed_categories": valid_categories
        }), 400


    event = Event(

        name=data["name"],

        date=data["date"],

        time=data["time"],

        location=data["location"],

        category=data["category"]

    )


    db.session.add(event)

    db.session.commit()


    return jsonify({

        "message": "Event created successfully",

        "event": {

            "id": event.id,

            "name": event.name,

            "category": event.category,

            "date": event.date,

            "time": event.time,

            "location": event.location

        }

    }), 201


# =========================================================
# GET SINGLE EVENT
# =========================================================

@app.route("/api/events/<int:event_id>", methods=["GET"])
def get_single_event(event_id):

    event = Event.query.get(event_id)


    if not event:

        return jsonify({
            "error": "Event not found"
        }), 404


    attendees = Attendee.query.filter_by(
        event_id=event.id
    ).count()


    votes = Vote.query.filter_by(
        event_id=event.id
    ).count()


    return jsonify({

        "id": event.id,

        "name": event.name,

        "category": event.category,

        "date": event.date,

        "time": event.time,

        "location": event.location,

        "attendees": attendees,

        "votes": votes

    })


# =========================================================
# GET ALL ATTENDEES
# =========================================================

@app.route("/api/attendees", methods=["GET"])
def get_attendees():

    attendees = Attendee.query.all()


    data = []


    for attendee in attendees:

        event = Event.query.get(
            attendee.event_id
        )


        data.append({

            "id": attendee.id,

            "name": attendee.name,

            "phone": attendee.phone,

            "registered_at": attendee.registered_at.isoformat(),

            "event_id": attendee.event_id,

            "event_name": event.name if event else "Unknown"

        })


    return jsonify({

        "total_attendees": len(data),

        "attendees": data

    })


# =========================================================
# GET POLL RESULTS
# =========================================================

@app.route("/api/poll-results", methods=["GET"])
def get_poll_results():

    event_id = request.args.get("event_id")


    if event_id:

        try:

            event_id = int(event_id)

        except ValueError:

            return jsonify({
                "error": "Invalid event_id"
            }), 400


        votes = Vote.query.filter_by(
            event_id=event_id
        ).all()


    else:

        votes = Vote.query.all()


    results = {

        "Keynote": 0,

        "Workshop": 0,

        "Networking": 0,

        "Other": 0

    }


    for vote in votes:

        if vote.choice in results:

            results[vote.choice] += 1


    return jsonify({

        "total_votes": len(votes),

        "results": results

    })


# =========================================================
# EVENT DASHBOARD
# =========================================================

@app.route("/api/dashboard/<int:event_id>", methods=["GET"])
def event_dashboard(event_id):

    event = Event.query.get(event_id)


    if not event:

        return jsonify({
            "error": "Event not found"
        }), 404


    total_attendees = Attendee.query.filter_by(
        event_id=event.id
    ).count()


    total_votes = Vote.query.filter_by(
        event_id=event.id
    ).count()


    keynote_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Keynote"
    ).count()


    workshop_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Workshop"
    ).count()


    networking_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Networking"
    ).count()


    other_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Other"
    ).count()


    return jsonify({

        "event": {

            "id": event.id,

            "name": event.name,

            "category": event.category,

            "date": event.date,

            "time": event.time,

            "location": event.location

        },


        "attendees": {

            "total": total_attendees

        },


        "poll": {

            "total_votes": total_votes,

            "Keynote": keynote_votes,

            "Workshop": workshop_votes,

            "Networking": networking_votes,

            "Other": other_votes

        }

    })


# =========================================================
# LEGACY DASHBOARD
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    event = Event.query.first()


    if not event:

        return jsonify({
            "error": "No events found"
        }), 404


    total_attendees = Attendee.query.filter_by(
        event_id=event.id
    ).count()


    total_votes = Vote.query.filter_by(
        event_id=event.id
    ).count()


    keynote_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Keynote"
    ).count()


    workshop_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Workshop"
    ).count()


    networking_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Networking"
    ).count()


    other_votes = Vote.query.filter_by(
        event_id=event.id,
        choice="Other"
    ).count()


    return jsonify({

        "event": {

            "id": event.id,

            "name": event.name,

            "category": event.category,

            "date": event.date,

            "time": event.time,

            "location": event.location

        },


        "attendees": {

            "total": total_attendees

        },


        "poll": {

            "total_votes": total_votes,

            "Keynote": keynote_votes,

            "Workshop": workshop_votes,

            "Networking": networking_votes,

            "Other": other_votes

        }

    })


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
