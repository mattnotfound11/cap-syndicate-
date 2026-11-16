# Backend

Not used yet. The Cap Syndicate site in `../frontend` is fully static: orders go through Messenger or email, and forms can post to a free form service (see `frontend/README.md`, "Forms").

This folder is reserved for when the shop needs a server, for example:

- a real order or inventory API instead of editing `frontend/js/products.js` by hand
- a drop-alerts mailing list with unsubscribe links
- online payments (GCash, Maya or cards) through a payment provider

Keep secrets in a `.env` file (already in `.gitignore`) and never commit them.
