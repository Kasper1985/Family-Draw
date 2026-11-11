import unittest
from unittest.mock import patch
import json
import threading
import tempfile
from pathlib import Path
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server
from server import (
    can_complete_assignments,
    eligible_choices,
    load_data,
    save_data,
    validate_items,
)


class AssignmentTests(unittest.TestCase):
    def test_user_cannot_draw_their_own_name(self):
        self.assertNotIn(
            1,
            eligible_choices([1, 2, 3], {}, 1),
        )

    def test_previous_assignments_are_not_drawn_again(self):
        choices = eligible_choices(
            [1, 2, 3, 4], {1: 2}, 3
        )
        self.assertNotIn(2, choices)

    def test_each_draw_keeps_a_complete_no_self_assignment_possible(self):
        people = [1, 2, 3, 4]
        for person_id in eligible_choices(people, {}, 1):
            self.assertTrue(can_complete_assignments(people, {1: person_id}))

    def test_two_people_can_be_assigned_to_each_other(self):
        people = [1, 2]
        self.assertEqual(eligible_choices(people, {}, 1), [2])
        self.assertTrue(can_complete_assignments(people, {1: 2}))


class ItemListTests(unittest.TestCase):
    def test_item_validation_trims_text_and_rejects_empty_entries(self):
        self.assertEqual(validate_items(["  Book  ", " tea "]), ["Book", "tea"])
        with self.assertRaises(ValueError):
            validate_items([" "])

    def test_item_lists_and_plaintext_pins_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            data_path = Path(directory) / "data.json"
            original = {
                "people": [
                    {"id": 1, "en": "Alla", "ua": "Алла"},
                    {"id": 2, "en": "Blake", "ua": "Блейк"},
                ],
                "assignments": {},
                "items": {"1": ["Книга"], "2": []},
                "pins": {"1": "123456", "2": "654321"},
            }
            with patch("server.DATA_FILE", data_path):
                save_data(original)
                loaded = load_data()
                self.assertEqual(loaded["items"], original["items"])
                self.assertEqual(loaded["pins"], original["pins"])
                saved_json = data_path.read_text(encoding="utf-8")
                self.assertIn('"123456"', saved_json)
                self.assertIn('"ua": "Алла"', saved_json)
                self.assertNotIn(r"\u0410", saved_json)

    def test_missing_item_lists_and_pins_default_by_person_id(self):
        with tempfile.TemporaryDirectory() as directory:
            data_path = Path(directory) / "data.json"
            data_path.write_text(
                json.dumps({
                    "people": [{"id": 1, "en": "Avery", "ua": "Ейвері"}],
                    "assignments": {},
                }),
                encoding="utf-8",
            )
            with patch("server.DATA_FILE", data_path):
                data = load_data()
            self.assertEqual(data["items"], {"1": []})
            self.assertEqual(data["pins"], {})


class ItemApiTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.data_path = Path(self.directory.name) / "data.json"
        self.data_path.write_text(
            json.dumps({
                "people": [
                    {"id": 1, "en": "Avery", "ua": "Ейвері"},
                    {"id": 2, "en": "Blake", "ua": "Блейк"},
                ],
                "assignments": {},
                "items": {"1": ["Book"], "2": []},
                "pins": {"1": "123456", "2": "654321"},
            }),
            encoding="utf-8",
        )
        self.data_patch = patch.object(server, "DATA_FILE", self.data_path)
        self.data_patch.start()
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.WheelHandler)
        self.thread = threading.Thread(target=self.httpd.serve_forever)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.httpd.server_port}"

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join()
        self.data_patch.stop()
        self.directory.cleanup()

    def request(self, path, payload=None):
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(self.base_url + path, data=body, method="POST" if body is not None else "GET")
        if body:
            request.add_header("Content-Type", "application/json")
        try:
            with urlopen(request) as response:
                return response.status, json.loads(response.read()), response.headers
        except HTTPError as error:
            return error.code, json.loads(error.read()), error.headers

    def test_login_and_actions_use_person_ids(self):
        status, state, _ = self.request("/api/state")
        self.assertEqual(status, 200)
        self.assertEqual(state["people"][0], {"id": 1, "en": "Avery", "ua": "Ейвері"})
        self.assertNotIn("items", state)

        status, _, _ = self.request("/api/login", {"user": 1, "pin": "654321"})
        self.assertEqual(status, 401)

        status, response, _ = self.request("/api/login", {"user": 1, "pin": "123456"})
        self.assertEqual(status, 200)
        self.assertEqual(response["user"], 1)

        status, account, _ = self.request("/api/account?user=1")
        self.assertEqual(status, 200)
        self.assertEqual(account["user"], 1)
        self.assertEqual(account["items"], {"1": ["Book"], "2": []})

        status, _, _ = self.request("/api/items", ["not", "an object"])
        self.assertEqual(status, 400)

        status, response, _ = self.request("/api/items", {
            "user": 2, "items": ["Camera"]
        })
        self.assertEqual(status, 200)
        self.assertEqual(response["items"], ["Camera"])
        data = load_data()
        self.assertEqual(data["items"]["1"], ["Book"])
        self.assertEqual(data["items"]["2"], ["Camera"])

        status, response, _ = self.request("/api/spin", {"user": 1})
        self.assertEqual(status, 200)
        self.assertEqual(response["assignment"], 2)
        self.assertEqual(load_data()["assignments"], {1: 2})

        status, _, _ = self.request("/api/spin", {"user": 999})
        self.assertEqual(status, 400)


if __name__ == "__main__":
    unittest.main()