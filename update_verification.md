# DFAB requested update verification

Baseline: `dfab-website-analytics-connection-stable-fixed.zip`

Requested changes only:
- Home About/company image card desktop height is dictated by the left content row; the image itself no longer contributes intrinsic height to the grid.
- Added compact Home landline chip: `080-22110244`.
- Footer: added landline `080-22110244`; WhatsApp social target changed to `+91 9908504466`.
- Contact: added landline `080-22110244`; WhatsApp number/link changed to `+91 9908504466`.
- Inquiry modal/chatbot/backend WhatsApp references updated to `+91 9908504466` so no public WhatsApp action sends users to the previous WhatsApp number.
- Projects: temporarily replaced the cinematic/video area with the exact uploaded product image, optimized to a 1600x900 WebP (~195 KB).

Preservation:
- Analytics logic/UI unchanged.
- Projects database cards/loading unchanged.
- Blog, MongoDB, Admin, Home sections outside the requested About card, SEO, chatbot behavior, Services, Careers, Contact form submission, Vercel/Render configuration unchanged.
- Existing video/sequence assets and components were not deleted; only Projects stops rendering the cinematic component for now, so it can be restored later.

Checks:
- `python -m py_compile backend/server.py`: PASS
- Uploaded project placeholder image: 1600x900 WebP, ~195 KB
- ZIP integrity: PASS after packaging
