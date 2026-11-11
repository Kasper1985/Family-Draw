# Family Draw

A small, dependency-free family name wheel. The server stores each assignment and shared item list in `data.json` so results are shared across devices using the same server.

The Items tab lets a person check all lists and edit their own list after entering their name and PIN. The app compares the PIN directly with the plain-text value in `data.json`, then trusts the selected name sent by the browser for later actions. This is a convenience check, not security.

## Run

```sh
python3 server.py
```

Open `http://localhost:8000` on the computer running the server. To use it from other devices on the trusted home network, open the server computer's local IP address at port `8000`. Anyone who can reach the server can impersonate any listed user, so do not expose it to an untrusted or public network.

## Set up PINs

Each person needs a six-digit PIN under their numeric ID in the `pins` object in `data.json`. PINs are stored in plain text and compared directly during sign-in. The selected ID is kept in browser local storage until sign-out.

```sh
python3 server.py --set-pin ID
```

Run the command once for every ID in `data.json`. Run it again to change a PIN. Stop the server before changing PINs with the command.

## Change the names

Edit the `people` array in `data.json`. Each person has a unique numeric `id` and `en`/`ua` display names. Keep `assignments` as `{}` to start a fresh draw. To reset the draw later, stop the server, clear the `assignments` object, and restart it.

## Check assignment rules

```sh
python3 -m unittest
```