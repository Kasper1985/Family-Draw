import argparse
import getpass
import json
import mimetypes
import re
import secrets
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data.json"
STATIC_FILES = {
    "/": (ROOT / "index.html", "text/html; charset=utf-8"),
    "/app.js": (ROOT / "app.js", "text/javascript; charset=utf-8"),
    "/styles.css": (ROOT / "styles.css", "text/css; charset=utf-8"),
}
DATA_LOCK = threading.Lock()
MAX_ITEMS = 50
MAX_ITEM_LENGTH = 200


def parse_person_id(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int) and value > 0:
        return value
    if isinstance(value, str) and re.fullmatch(r"[1-9][0-9]*", value):
        return int(value)
    return None


def validate_items(items):
    if not isinstance(items, list) or len(items) > MAX_ITEMS:
        raise ValueError(f"A list can contain at most {MAX_ITEMS} items.")
    normalized = []
    for item in items:
        if not isinstance(item, str):
            raise ValueError("Every item must be text.")
        item = item.strip()
        if not item or len(item) > MAX_ITEM_LENGTH:
            raise ValueError(f"Items must contain 1 to {MAX_ITEM_LENGTH} characters.")
        normalized.append(item)
    return normalized


def load_data():
    with DATA_FILE.open("r", encoding="utf-8") as data_file:
        data = json.load(data_file)

    people = data.get("people")
    assignments = data.get("assignments")
    items = data.get("items", {})
    pins = data.get("pins", {})
    if not isinstance(people, list) or not all(
        isinstance(person, dict)
        and parse_person_id(person.get("id")) is not None
        and all(isinstance(person.get(language), str) and person[language].strip() for language in ("en", "ua"))
        for person in people
    ):
        raise ValueError("data.json 'people' must contain objects with positive IDs and 'en'/'ua' names.")
    person_ids = [person["id"] for person in people]
    if len(set(person_ids)) != len(person_ids):
        raise ValueError("Person IDs in data.json must be unique.")
    for language in ("en", "ua"):
        if len({person[language] for person in people}) != len(people):
            raise ValueError(f"Person names in '{language}' must be unique.")
    person_id_set = set(person_ids)
    if not isinstance(assignments, dict):
        raise ValueError("data.json must contain an 'assignments' object.")
    normalized_assignments = {}
    for user, name in assignments.items():
        user_id = parse_person_id(user)
        name_id = parse_person_id(name)
        if user_id not in person_id_set or name_id not in person_id_set:
            raise ValueError("Assignments must reference person IDs in the 'people' list.")
        normalized_assignments[user_id] = name_id
    if len(set(normalized_assignments.values())) != len(normalized_assignments):
        raise ValueError("A person cannot be assigned more than once.")
    if any(user == name for user, name in normalized_assignments.items()):
        raise ValueError("A person cannot be assigned their own name.")
    if not isinstance(items, dict):
        raise ValueError("data.json 'items' must map person IDs to item lists.")
    normalized_items = {str(person_id): [] for person_id in person_ids}
    for person, person_items in items.items():
        person_id = parse_person_id(person)
        if person_id not in person_id_set:
            raise ValueError("data.json 'items' must map listed person IDs to item lists.")
        try:
            normalized_items[str(person_id)] = validate_items(person_items)
        except ValueError as error:
            raise ValueError(f"Invalid item list for person {person_id}: {error}") from error
    if not isinstance(pins, dict):
        raise ValueError("data.json 'pins' must map person IDs to six-digit PINs.")
    normalized_pins = {}
    for person, pin in pins.items():
        person_id = parse_person_id(person)
        if person_id not in person_id_set or not isinstance(pin, str) or not re.fullmatch(r"\d{6}", pin):
            raise ValueError("data.json 'pins' must map listed person IDs to six-digit PINs.")
        normalized_pins[str(person_id)] = pin
    return {
        "people": people,
        "assignments": normalized_assignments,
        "items": normalized_items,
        "pins": normalized_pins,
    }


def can_complete_assignments(people, assignments):
    remaining_people = [person for person in people if person not in assignments]
    remaining_names = [
        person for person in people if person not in assignments.values()
    ]
    matched_people = {}

    def match(person, visited_names):
        for name in remaining_names:
            if name == person or name in visited_names:
                continue
            visited_names.add(name)
            if name not in matched_people or match(matched_people[name], visited_names):
                matched_people[name] = person
                return True
        return False

    return all(match(person, set()) for person in remaining_people)


def eligible_choices(people, assignments, user):
    unavailable_names = set(assignments.values())
    choices = []
    for name in people:
        if name == user or name in unavailable_names:
            continue
        trial_assignments = dict(assignments)
        trial_assignments[user] = name
        if can_complete_assignments(people, trial_assignments):
            choices.append(name)
    return choices


def save_data(data):
    temporary_file = DATA_FILE.with_suffix(".json.tmp")
    with temporary_file.open("w", encoding="utf-8") as data_file:
        json.dump(
            {
                "people": data["people"],
                "assignments": {str(user): name for user, name in data["assignments"].items()},
                "items": data["items"],
                "pins": data["pins"],
            },
            data_file,
            ensure_ascii=False,
            indent=2,
        )
        data_file.write("\n")
    temporary_file.replace(DATA_FILE)


class WheelHandler(BaseHTTPRequestHandler):
    def send_json(self, status, payload, headers=()):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for name, value in headers:
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        request = urlparse(self.path)
        if request.path == "/api/state":
            try:
                with DATA_LOCK:
                    data = load_data()
                self.send_json(
                    200,
                    {
                        "people": data["people"],
                    },
                )
            except (OSError, ValueError, json.JSONDecodeError) as error:
                self.send_json(500, {"error": str(error)})
            return
        if request.path == "/api/account":
            user = parse_person_id(parse_qs(request.query).get("user", [""])[0])
            try:
                with DATA_LOCK:
                    data = load_data()
                if user not in {person["id"] for person in data["people"]}:
                    self.send_json(404, {"error": "Choose a valid user."})
                    return
                self.send_json(
                    200,
                    {
                        "user": user,
                        "assignment": data["assignments"].get(user),
                        "items": data["items"],
                    },
                )
            except (OSError, ValueError, json.JSONDecodeError) as error:
                self.send_json(500, {"error": str(error)})
            return

        file_entry = STATIC_FILES.get(request.path)
        if file_entry is None:
            self.send_error(404)
            return
        file_path, content_type = file_entry
        try:
            body = file_path.read_bytes()
        except OSError:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type or mimetypes.guess_type(file_path)[0])
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        request_path = urlparse(self.path).path
        if request_path == "/api/login":
            self.login()
            return
        if request_path == "/api/items":
            self.save_items()
            return
        if request_path != "/api/spin":
            self.send_error(404)
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length > 4096:
                self.send_json(413, {"error": "Request is too large."})
                return
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            if not isinstance(payload, dict):
                self.send_json(400, {"error": "Expected an object containing a user."})
                return
            user = parse_person_id(payload.get("user"))
            with DATA_LOCK:
                data = load_data()
                people_ids = [person["id"] for person in data["people"]]
                if user not in people_ids:
                    self.send_json(400, {"error": "Choose a valid user."})
                    return
                assignment = data["assignments"].get(user)
                if assignment is None:
                    choices = eligible_choices(people_ids, data["assignments"], user)
                    if not choices:
                        self.send_json(
                            409,
                            {"error": "There are no names left for this draw."},
                        )
                        return
                    assignment = secrets.choice(choices)
                    data["assignments"][user] = assignment
                    save_data(data)

            self.send_json(200, {"assignment": assignment})
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": "Could not read the spin request: " + str(error)})
        except (OSError, json.JSONDecodeError) as error:
            self.send_json(500, {"error": str(error)})

    def login(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length > 4096:
                self.send_json(413, {"error": "Request is too large."})
                return
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            user = payload.get("user") if isinstance(payload, dict) else None
            pin = payload.get("pin") if isinstance(payload, dict) else None
            user = parse_person_id(user)
            if user is None:
                self.send_json(400, {"error": "Choose your name from the list."})
                return
            if not isinstance(pin, str) or not re.fullmatch(r"\d{6}", pin):
                self.send_json(400, {"error": "Enter your 6-digit PIN."})
                return
            with DATA_LOCK:
                data = load_data()
                if user not in {person["id"] for person in data["people"]} or data["pins"].get(str(user)) != pin:
                    self.send_json(401, {"error": "Name or PIN is incorrect."})
                    return
            self.send_json(200, {"user": user})
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": "Could not read the sign-in request: " + str(error)})
        except OSError as error:
            self.send_json(500, {"error": str(error)})

    def save_items(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length > 16384:
                self.send_json(413, {"error": "Request is too large."})
                return
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            if not isinstance(payload, dict):
                self.send_json(400, {"error": "Expected an object containing an item list."})
                return
            user = payload.get("user")
            user = parse_person_id(user)
            if user is None:
                self.send_json(400, {"error": "Choose a valid user."})
                return
            try:
                items = validate_items(payload.get("items"))
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return

            with DATA_LOCK:
                data = load_data()
                if user not in {person["id"] for person in data["people"]}:
                    self.send_json(400, {"error": "Choose a valid user."})
                    return
                data["items"][str(user)] = items
                save_data(data)
            self.send_json(200, {"items": items})
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": "Could not read the item list: " + str(error)})
        except OSError as error:
            self.send_json(500, {"error": str(error)})

    def log_message(self, format_string, *args):
        print("%s - %s" % (self.address_string(), format_string % args))


def main():
    parser = argparse.ArgumentParser(description="Run the family name wheel.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--set-pin", metavar="ID", help="Set a person's six-digit PIN.")
    args = parser.parse_args()
    if args.set_pin:
        if not re.fullmatch(r"\d{6}", (pin := getpass.getpass("New PIN (6 digits): "))):
            parser.error("PINs must contain exactly 6 digits.")
        if pin != getpass.getpass("Confirm PIN: "):
            parser.error("PINs did not match.")
        with DATA_LOCK:
            data = load_data()
            person_id = parse_person_id(args.set_pin)
            if person_id not in {person["id"] for person in data["people"]}:
                parser.error("ID is not in the people list.")
            data["pins"][str(person_id)] = pin
            save_data(data)
        print(f"PIN saved for ID {person_id}.")
        return
    server = ThreadingHTTPServer((args.host, args.port), WheelHandler)
    print("Family wheel available at http://localhost:%d" % args.port)
    print("For other devices on your trusted home network, use this computer's IP address.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping family wheel.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()