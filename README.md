# Music Library (Learning Project)

A basic full-stack app to search for songs and save them to a personal library.
Built with **FastAPI** (backend) and **React + Vite** (frontend, no extra
libraries beyond React itself).

> ⚠️ Every backend endpoint is a **dummy/mock implementation** — no real audio
> files are downloaded and no real database is used, just an in-memory Python
> list that resets whenever the server restarts. Swap these out once you're
> ready to connect a real music source and a real database.

## Project structure

```
music-library-app/
├── backend/          FastAPI app: dummy search / download / library endpoints
│   ├── main.py
│   └── requirements.txt
└── frontend/          React (Vite) app: Home page + Library page
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── pages/
        │   ├── Home.jsx
        │   └── Library.jsx
        └── components/
            ├── Navbar.jsx
            └── SongCard.jsx
```

## Running locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs at http://localhost:8000 — interactive API docs at http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

## How it works

- **Home** — search the dummy catalog by song or artist, then click
  "Download" to add a track to your library (simulated with a short delay).
- **Library** — lists everything "downloaded" so far, with a "Remove" button.
  It re-fetches from the backend every time you open it.

## Deploying to Vercel

- The **frontend** deploys to Vercel as a standard Vite app — no config needed.
- The **backend** keeps its "library" in memory, which won't persist on
  Vercel's serverless functions (each request can hit a fresh instance). For
  real use you'd add a real database (see the Postgres/Supabase options from
  earlier) and either host FastAPI somewhere that stays running (Render,
  Railway, Fly.io) or move the storage layer to something serverless-friendly.
- Set `VITE_API_URL` in the frontend's Vercel project settings to point at
  wherever the backend ends up living (it defaults to `http://localhost:8000`).

## Next steps

- Replace `DUMMY_CATALOG` and `library_db` in `backend/main.py` with a real
  music API and a real database.
- Add user accounts if each person should have their own library.
