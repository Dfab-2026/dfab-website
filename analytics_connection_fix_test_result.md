# Analytics Connection Fix Verification

- Root cause: Analytics used only the same-origin Vercel `/api` proxy. A proxy/network failure surfaced as "Could not reach the analytics API" even when the Render backend itself was reachable.
- Fix: Analytics now tries the existing same-origin `/api` path first, then the existing direct Render API only for connectivity/proxy/gateway failures.
- Authentication errors (401) and validation errors are not retried or hidden.
- Existing Analytics request timeout remains 60 seconds default / 75 seconds for Admin Analytics login and summary calls.
- Frontend syntax (`node --check`): PASS.
- Backend Python compile: PASS.
- Preservation diff against previous ZIP: only `frontend/src/utils/analyticsApi.js` changed, plus this verification file.
