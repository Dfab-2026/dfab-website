# DFAB backend connection false-error fix

## Scope
Only Analytics backend-request timeout/error reporting was changed.

## Root cause
The Analytics API helper aborted requests after 3 seconds. This could show "Please confirm the backend is running" even when the backend was healthy but still starting or processing the analytics aggregation.

## Changes
- `frontend/src/utils/analyticsApi.js`
  - default timeout increased from 3s to 60s
  - supports per-request `timeoutMs`
- `frontend/src/pages/AdminAnalytics.jsx`
  - analytics login and summary requests use 75s timeout
  - timeout/API/network errors now show accurate messages instead of always saying backend is not connected

## Preservation
No backend routes, MongoDB logic, Projects, Blog, Home, Contact, Careers, Chatbot, AI SEO, video scroll, or other site flows were changed.

## Checks
- backend/server.py Python compile: PASS
- frontend/src/utils/analyticsApi.js Node syntax check: PASS
- ZIP integrity: PASS
