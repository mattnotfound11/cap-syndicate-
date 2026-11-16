# Cap Syndicate

Official website for **Cap Syndicate**, a cap and streetwear shop in Iloilo City. *Built for the Streets.*

```
cap-syndicate/
├── frontend/   The website (static HTML, CSS, JS). Start here: frontend/README.md
└── backend/    Reserved. The site runs without a server for now.
```

- **Edit products, deals, promo code, countdowns and contact details:** `frontend/js/products.js`
- **Preview locally:** `cd frontend && python3 -m http.server 8000`, then open http://localhost:8000
- **Deploy for free:** Netlify, Vercel or GitHub Pages with `frontend` as the site folder. Steps are in `frontend/README.md`.

## Repo housekeeping

- `cap-syndicate-/` is a second clone of this same GitHub repo sitting inside the project. It only holds the two early README files and is ignored here. It is safe to delete once you've confirmed nothing in it is needed.
- Folders like `.windsurf/`, `.codex/`, `.roo/`, `data/` and `skills/` were created by the AI skills installer. They're ignored in `.gitignore`. `.agents/`, `.claude/` and `skills-lock.json` are left visible in case you want to commit your skills setup.
