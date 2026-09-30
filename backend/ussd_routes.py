import africastalking
from flask import Blueprint, request

from config import Config
from extensions import db
from models import AirtimeReward, Attendee, Event, TriviaQuestion, TriviaResponse

ussd_bp = Blueprint("ussd", __name__)

africastalking.initialize(Config.AT_USERNAME, Config.AT_API_KEY)
airtime = africastalking.Airtime

CATEGORIES = {
    "1": "Workshop",
    "2": "Concert",
    "3": "Tech Event",
    "4": "Social Event",
}


def _events_in(category):
    return Event.query.filter_by(category=category).order_by(Event.id.asc()).all()


def _render_question(question):
    lines = "\n".join(
        f"{i}. {opt}" for i, opt in enumerate(question.options, start=1)
    )
    return f"CON {question.question}\n\n{lines}"


def _award_airtime(phone, amount, event_id):
    """Best-effort airtime send. Never lets a failure break the USSD response -
    the correct answer and the reward record are saved regardless."""
    reward = AirtimeReward(amount=amount, reason="Correct trivia answer", status="pending")
    attendee = Attendee.query.filter_by(phone_number=phone, event_id=event_id).first()
    if attendee:
        reward.attendee_id = attendee.id
    db.session.add(reward)
    db.session.commit()

    try:
        airtime.send(recipients=[{"phoneNumber": phone, "amount": str(amount), "currency_code": "KES"}])
        reward.status = "sent"
        db.session.commit()
        return f"KES {amount:.0f} airtime is on its way to you!"
    except Exception as e:  # noqa: BLE001 - any AT/SDK failure just changes the message, not the flow
        reward.status = f"failed: {e}"
        db.session.commit()
        return f"You've earned KES {amount:.0f} airtime - it's queued for delivery."


def _handle_trivia_answer(question, choice_str, phone):
    try:
        choice_index = int(choice_str) - 1
    except ValueError:
        return "END Invalid answer."
    if choice_index < 0 or choice_index >= len(question.options):
        return "END Invalid answer."

    already_answered = TriviaResponse.query.filter_by(
        question_id=question.id, phone_number=phone
    ).first()
    if already_answered:
        return "END You've already answered this question.\n\nThanks for playing!"

    is_correct = choice_index == question.correct_option_index
    db.session.add(
        TriviaResponse(
            question_id=question.id,
            phone_number=phone,
            chosen_index=choice_index,
            is_correct=is_correct,
        )
    )
    db.session.commit()

    if is_correct:
        reward_note = _award_airtime(phone, question.airtime_reward, question.event_id)
        extra = f"\n\n{question.explanation}" if question.explanation else ""
        return f"END CORRECT!{extra}\n\n{reward_note}"

    correct_text = question.options[question.correct_option_index]
    extra = f"\n\n{question.explanation}" if question.explanation else ""
    return f"END Not quite.\n\nCorrect answer: {correct_text}{extra}"


@ussd_bp.route("/ussd", methods=["POST"])
def ussd():
    text = request.form.get("text", "")
    phone = request.form.get("phoneNumber", "")
    parts = text.split("*") if text else []

    # Screen 1: pick a category
    if text == "":
        return (
            "CON WELCOME TO EVENTIDE\n\n"
            "What type of event?\n\n"
            "1. Workshop\n2. Concert\n3. Tech Event\n4. Social Event"
        )

    # Screen 2: pick an event within that category
    if len(parts) == 1:
        category = CATEGORIES.get(parts[0])
        if not category:
            return "END Invalid event category.\n\nPlease try again."

        events = _events_in(category)
        if not events:
            return f"END No {category} events are currently available.\n\nPlease try again later."

        response = f"CON {category.upper()} EVENTS\n\n"
        for i, event in enumerate(events, start=1):
            response += f"{i}. {event.name}\n"
        return response

    category = CATEGORIES.get(parts[0])
    if not category:
        return "END Invalid event category."

    try:
        event_index = int(parts[1])
    except ValueError:
        return "END Invalid event selection."

    events = _events_in(category)
    if event_index < 1 or event_index > len(events):
        return "END Invalid event selection."

    event = events[event_index - 1]

    # Screen 3: event menu
    if len(parts) == 2:
        return (
            f"CON {event.name}\n\n"
            "1. Register\n2. Event Information\n3. Live Trivia\n4. Programme"
        )

    option = parts[2]

    # Screen 4+: branch by menu option
    if option == "1":  # Register
        if len(parts) == 3:
            return "CON EVENT REGISTRATION\n\nEnter your name:"

        if len(parts) == 4:
            return f"CON Hello {parts[3]}!\n\nEnter your phone number:"

        if len(parts) == 5:
            name, entered_phone = parts[3], parts[4]
            db.session.add(Attendee(name=name, phone_number=entered_phone, event_id=event.id))
            db.session.commit()
            return (
                f"END REGISTRATION SUCCESSFUL!\n\n"
                f"Event: {event.name}\nName: {name}\nPhone: {entered_phone}\n\n"
                "Thank you for registering."
            )

    elif option == "2":  # Event information
        if len(parts) == 3:
            return f"CON EVENT INFORMATION\n\n{event.name}\n\n1. Date & Time\n2. Location\n3. Back"
        if len(parts) == 4:
            if parts[3] == "1":
                return f"END DATE & TIME\n\n{event.date}\n\n{event.time}"
            if parts[3] == "2":
                return f"END LOCATION\n\n{event.location}"
            if parts[3] == "3":
                return (
                    f"CON {event.name}\n\n"
                    "1. Register\n2. Event Information\n3. Live Trivia\n4. Programme"
                )

    elif option == "3":  # Live trivia - organizer-authored questions, not hardcoded
        questions = (
            TriviaQuestion.query.filter_by(event_id=event.id)
            .order_by(TriviaQuestion.id.asc())
            .all()
        )
        if not questions:
            return "END No trivia questions are available for this event yet.\n\nCheck back later!"

        single = len(questions) == 1

        if len(parts) == 3:
            if single:
                return _render_question(questions[0])
            lines = "\n".join(f"{i}. {q.question[:40]}" for i, q in enumerate(questions, start=1))
            return f"CON TRIVIA TIME!\n\nChoose a question:\n\n{lines}"

        if single:
            return _handle_trivia_answer(questions[0], parts[3], phone)

        try:
            q_index = int(parts[3])
        except ValueError:
            return "END Invalid question selection."
        if q_index < 1 or q_index > len(questions):
            return "END Invalid question selection."
        question = questions[q_index - 1]

        if len(parts) == 4:
            return _render_question(question)
        if len(parts) == 5:
            return _handle_trivia_answer(question, parts[4], phone)

    elif option == "4":  # Programme
        if len(parts) == 3:
            return "CON EVENT PROGRAMME\n\n1. Opening\n2. Keynote\n3. Networking\n4. Closing"
        if len(parts) == 4:
            slots = {
                "1": "OPENING\n\n8:30 AM - 9:00 AM\n\nRegistration and Welcome",
                "2": "KEYNOTE\n\n10:00 AM - 11:00 AM\n\nMain Keynote Session",
                "3": "NETWORKING\n\n2:00 PM - 3:30 PM\n\nNetworking and Collaboration",
                "4": "CLOSING\n\n5:30 PM - 6:30 PM\n\nClosing Remarks and Awards",
            }
            if parts[3] in slots:
                return f"END {slots[parts[3]]}"

    return "END Invalid option.\n\nPlease try again."
