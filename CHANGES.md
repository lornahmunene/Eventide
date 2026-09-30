# Eventide2 integration fixes

## What changed

- Added backend-backed Eventide accounts with Flask sessions.
- Registration/login now goes through Flask; localStorage is no longer trusted as the source of authentication.
- Added phone number to attendee accounts so event registration can be linked to a person.
- Added `POST /api/attendees` and made ticket/event registration create the attendee in Flask first.
- If the backend registration fails, the frontend does not create the local ticket/attendee record.
- Event creation is organizer-only (`Planner`) in both the UI and backend session check.
- Removed Create Event buttons/entry points for non-organizers.
- Event creation now writes to Flask first before updating the frontend.
- Vendor applications and trivia creation now write to Flask first before showing success locally.
- Kept read-only event fallback/demo data, but mutation operations do not silently fall back to fake local records.
- Fixed the API request header merge so JSON `Content-Type` is preserved when custom headers are used.
- Added localhost and 127.0.0.1 to the default CORS development origins.

## Development setup

The project has no root `package.json`; npm commands belong in `frontend/`.

If your local project has an old lockfile at:

`Eventide/package-lock.json`

and there is no `Eventide/package.json`, remove that stale root lockfile. Keep:

`Eventide/frontend/package-lock.json`

Then:

```bash
cd ~/Development/Eventide2/Eventide/frontend
npm install
npm run dev
```

Start Flask separately:

```bash
cd ~/Development/Eventide2/Eventide/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The frontend expects Flask at `http://localhost:5000` by default. If needed, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, set a strong `SECRET_KEY` in the backend environment.

## Africa's Talking vendor SMS

The backend already has:

- `POST /api/vendors/<vendor_id>/messages` for organizer -> vendor SMS.
- `POST /sms/inbound` for vendor -> organizer replies.

For Sandbox testing, use Africa's Talking Simulator numbers and configure the inbound callback to a publicly reachable backend URL.
