# DFAB Website — Consolidated Fresh Build

This folder is the consolidated React + FastAPI DFAB website with the existing completed UI/flows preserved and the latest database/API fixes applied.

## Projects and Blog

- MongoDB is the source of truth for Projects and Blog.
- No hardcoded six-project fallback is used.
- No sample/fake Blog posts are used.
- Project Admin loads MongoDB records for edit/delete/featured actions.
- Blog Admin loads MongoDB records for edit/delete/publish actions.
- The Home Featured Projects section uses published MongoDB projects only and shows up to three cards.
- Legacy/current MongoDB field variants are normalized by the backend.
- Large images stored as MongoDB data URLs are served through media endpoints so list requests stay lightweight.

Backend environment must point to the existing database that contains the real records:

```env
MONGO_URL=your_existing_mongodb_atlas_connection_string
DB_NAME=dfab_db
```

## Local / LAN development

The frontend now recognizes localhost and private LAN addresses such as `192.168.1.55`.

When the site is opened at:

```text
http://192.168.1.55:3000
```

and no remote backend is configured, API calls automatically use:

```text
http://192.168.1.55:8000/api
```

If `.env` contains `http://localhost:8000` while the frontend is opened through a LAN IP, the frontend rewrites the backend host to the current LAN hostname instead of incorrectly calling the viewing device's localhost.

`start-live.ps1` and `npm run start:backend` bind FastAPI to `0.0.0.0:8000`, so the backend can be reached from devices on the same network.

## CORS

The backend preserves the configured `CORS_ORIGINS` behavior and additionally supports:

- localhost / 127.0.0.1
- 192.168.x.x
- 10.x.x.x
- 172.16.x.x through 172.31.x.x
- Vercel preview domains

## Scroll video / video bar

The existing Services scroll-video feature is preserved.

- Component: `frontend/src/components/ScrollScrubVideo.jsx`
- Video: `frontend/public/videos/products-scroll.mp4`
- Progress/video bar: preserved
- Services page integration: preserved

## Production

Vercel keeps the SPA rewrite and `/api/*` proxy to Render. An explicit `REACT_APP_BACKEND_URL` is still supported.

Recommended Vercel setting:

```env
REACT_APP_BACKEND_URL=https://dfab-backend.onrender.com
```

Deploy the Render backend first, verify `/api/health`, then deploy the frontend.
