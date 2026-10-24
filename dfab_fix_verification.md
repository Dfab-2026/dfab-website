# DFAB Projects / Blog Stability Fix Verification

## Scope
Only the shared API-loading path for Projects and Blog was repaired. Existing UI, Home company-image sizing, Analytics login styling, cinematic scroll/video area, MongoDB schema, backend routes, chatbot, AI SEO, Careers, Contact and other completed flows were preserved.

## Root cause addressed
The previous frontend introduced two production API candidates: the Vercel same-origin `/api` proxy and a second direct Render URL. That created different CORS/timeout behavior between pages and could leave Projects/Blog in `can't load` state, especially around Render cold starts.

The repaired version uses one stable production route: same-origin `/api` on Vercel. `frontend/vercel.json` continues to proxy `/api/*` to the existing Render backend. Localhost/LAN still uses the local backend on port 8000.

## Stability changes
- Production frontend API is always `/api` (same origin).
- Projects use only MongoDB `/api/projects`; no hardcoded/localStorage/sample fallback.
- Blog uses only MongoDB `/api/blog/posts`; no sample posts.
- Projects and Blog get two same-origin attempts with a 75-second cold-start budget.
- Blog detail uses the same stable route and retry behavior.
- No automatic database seed, cleanup, delete-many, collection drop, or default-project deletion code exists.
- Existing explicit Admin Delete actions are preserved and remain user-triggered only.

## Preservation checks
- Home company image remains equal-height with the left About content on desktop and uses `object-contain`.
- Analytics Admin login retains the matching Settings-icon login card.
- Projects cinematic scroll component remains present.
- Backend source was not changed.
- Vercel rewrite configuration was not changed.

## Checks run
- `node --check frontend/src/utils/backendApi.js`: PASS
- `node --check frontend/src/utils/projectsApi.js`: PASS
- `python -m py_compile backend/server.py`: PASS
- JSX delimiter/structure checks for Projects, Blog and BlogPost: PASS
- Production API resolver simulation: `/api`: PASS
- LAN API resolver simulation (`192.168.1.55`): `http://192.168.1.55:8000/api`: PASS
- localhost API resolver simulation: `http://localhost:8000/api`: PASS
- Search for automatic destructive DB operations (`delete_many`, `drop`, old default-project cleanup): NONE FOUND
- Diff against supplied latest baseline: only 5 frontend files changed
- Full `npm ci` / CRA build: NOT COMPLETED; dependency installation exceeded the container timeout. No build-pass claim is made.

## Files changed
- `frontend/src/utils/backendApi.js`
- `frontend/src/utils/projectsApi.js`
- `frontend/src/pages/Projects.jsx` (request timeout only)
- `frontend/src/pages/Blog.jsx` (data loading only; responsive UI preserved)
- `frontend/src/pages/BlogPost.jsx` (data loading only; responsive UI preserved)
