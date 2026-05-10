# MythicMart Production Guide

## Environment

Copy `backend/.env.example` and `frontend/.env.example`, then set real production values.

Required backend values:

- `NODE_ENV=production`
- `MONGO_URI` pointing to a managed MongoDB cluster
- `JWT_SECRET` with at least 32 random characters
- `FRONTEND_URLS` as a comma-separated allowlist of deployed frontend origins

Required frontend values:

- `VITE_API_BASE_URL` pointing to the public API URL
- `VITE_BASE_PATH=/` for root domains, or `/7-MythicMart/` for GitHub Pages

## Database

Run `npm run sync-indexes` from `backend/` after connecting to production MongoDB. This creates the user, product, and order indexes used for login, search, filtering, and order history queries.

## Security Checklist

- Keep `.env` files out of git.
- Use HTTPS only in production.
- Store JWT secrets in the cloud provider secret manager.
- Keep `FRONTEND_URLS` narrow; do not use `*` with credentials.
- Run MongoDB with authentication, network allowlists, and regular backups.
- Put the API behind a reverse proxy or managed load balancer with request logging.

## Local Docker Smoke Test

```bash
docker compose up --build
```

Frontend: `http://localhost:8080`

Backend health: `http://localhost:5001/api/health`

## CI/CD

The GitHub Actions workflow installs dependencies, runs backend tests, lints the frontend, and builds the frontend. Add deployment steps for your target provider after these jobs pass.
