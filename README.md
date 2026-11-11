# Family Draw

A small, dependency-free family name wheel. The server stores each assignment and shared item list in `data.json`, so results are shared across devices using the same server. The interface is available in English, German, and Ukrainian; displayed names use the `en` or `ua` fields, so German uses the English names.

After signing in, the Draw tab lets each person draw once. Nobody can draw their own name, and each name can be assigned only once; choices are restricted to keep a complete draw possible. Assignments are saved in `data.json`. The Items tab shows everyone's lists and lets the signed-in person edit their own. Lists can contain up to 50 non-empty items, each at most 200 characters.

PINs are stored in plain text in `data.json`. The sign-in endpoint checks the PIN, but the server does not create a session or authorize later requests; those requests trust the person ID sent by the browser. Anyone who can reach the server can impersonate a listed person. This is a convenience check, not security.

## Run

```sh
python3 server.py
```

Open `http://localhost:8000` on the computer running the server. To use it from other devices on the trusted home network, open the server computer's local IP address at port `8000`. Anyone who can reach the server can impersonate any listed user, so do not expose it to an untrusted or public network.

## Set up PINs

The current `data.json` already has a six-digit PIN for every listed person. To set or change one, run this command with that person's numeric ID; the server prompts you to enter and confirm the six-digit PIN. Stop the running server first so it cannot overwrite the data file at the same time. The selected ID is kept in browser local storage until sign-out.

```sh
python3 server.py --set-pin ID
```

For a new person, add their PIN this way before they sign in. The PIN is saved in plain text under that person's ID in `data.json`.

## Change the names

Edit the `people` array in `data.json`. Each person needs a unique positive numeric `id`, and unique, non-empty `en` and `ua` names. When adding or removing people, keep the IDs in `assignments`, `items`, and `pins` consistent with the `people` array. Keep `assignments` as `{}` to start a fresh draw. To reset the draw later, stop the server, clear the `assignments` object, and restart it.

## Run tests

```sh
python3 -m unittest
```