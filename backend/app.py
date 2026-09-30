from flask import Flask
from flask_cors import CORS

from config import Config
from events_routes import events_bp
from extensions import db
from models import Event
from ussd_routes import ussd_bp
from vendor_routes import vendor_bp
from auth_routes import auth_bp



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Only your frontend's origin(s) can call /api/* - set ALLOWED_ORIGINS in .env
    CORS(app, resources={r"/api/*": {"origins": Config.ALLOWED_ORIGINS}}, supports_credentials=True)

    db.init_app(app)
    app.register_blueprint(vendor_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(ussd_bp)
    app.register_blueprint(events_bp)

    with app.app_context():
        db.create_all()
        _seed_default_event()

    return app


def _seed_default_event():
    if Event.query.count() == 0:
        db.session.add(
            Event(
                name="Africa's Talking Event",
                date="30 September 2026",
                time="8:30 AM - 6:30 PM",
                location="Africa's Talking Ltd., Kabarsiran Ave, Nairobi",
                category="Tech Event",
            )
        )
        db.session.commit()


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
