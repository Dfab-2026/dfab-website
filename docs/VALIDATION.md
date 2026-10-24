# Validation status — v0.4

Validated in the build environment:
- TypeScript/TSX parser syntax check: PASS (63 files, 0 syntax errors)
- Python extractor compile: PASS
- Python extractor unit tests: PASS (6/6)
- Deterministic engineering/core tests: PASS (4/4)
- Existing Supabase migrations remain unchanged; no new database migration is required for v0.4.

Full Next.js dependency-aware build/lint was not executed because this artifact environment does not contain the project's installed npm dependency tree. Run `npm install`, `npm run build`, and `npm run lint` in the deployment/local environment before production release.

Format note: PDF/images have native preview/extraction. DXF, STEP/STP and IGES/IGS are ingested and text entities are parsed best-effort. DWG is accepted and stored, but exact proprietary DWG geometry requires a conversion/CAD connector for production-grade geometry extraction; the review flow surfaces this limitation instead of silently guessing.
