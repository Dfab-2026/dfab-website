# DFAB Gemini Chatbot + AI SEO Setup

This update keeps the existing website flows intact and changes only the Gemini chatbot and AI-assisted SEO path.

## 1. Render backend environment

Set these variables on the DFAB Render backend service:

```env
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_CHAT_MODEL=gemini-3.5-flash-lite
GEMINI_SEO_MODEL=gemini-3.5-flash-lite
```

Keep the existing MongoDB, Resend, admin, and CORS variables unchanged. Redeploy the backend after saving the environment variables.

## 2. Vercel frontend environment

Set/keep:

```env
REACT_APP_BACKEND_URL=https://dfab-backend.onrender.com
REACT_APP_AI_SEO_ENABLED=true
REACT_APP_AI_SEO_ALLOW_LOCAL=false
```

Redeploy Vercel after changing a `REACT_APP_*` variable because Create React App embeds those values at build time.

## 3. Check the chatbot

1. Open `https://dfab-backend.onrender.com/api/health`.
2. Confirm `gemini_enabled` is `true`.
3. Open the deployed DFAB website and ask the chatbot a non-FAQ question such as `Explain when TIG welding is preferable for a stainless steel fabrication project.`
4. In the browser Network panel, the `POST /api/chat` request should return HTTP 200 and a `response`.
5. Common DFAB FAQs are intentionally answered locally to consume zero Gemini tokens; more open-ended manufacturing questions use Gemini.

## 4. Check SEO tags

On any public route such as `/services` or `/projects`, open DevTools Console and run:

```js
({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.content,
  keywords: document.querySelector('meta[name="keywords"]')?.content,
  canonical: document.querySelector('link[rel="canonical"]')?.href,
  robots: document.querySelector('meta[name="robots"]')?.content,
  schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(x => x.textContent)
})
```

Also verify:

- `https://dfab.in/robots.txt`
- `https://dfab.in/sitemap.xml`
- Page source/default metadata and live DOM metadata in DevTools
- Google Search Console URL Inspection after deployment

The site always has deterministic metadata. AI SEO only refines that metadata; if Gemini is unavailable, the original valid tags remain.

## 5. Token optimization in this build

- Gemini 3.5 Flash-Lite is the default chat and SEO model.
- Chat sends only the latest two conversation turns to Gemini.
- Common company FAQ answers bypass Gemini entirely.
- Chat output is capped at 320 tokens.
- SEO input summary is capped and output is capped at 220 tokens.
- SEO results are cached in MongoDB and for 30 days in the visitor browser.
- A temporary Gemini failure is cached for six hours to avoid repeated retry traffic.
- AI SEO is disabled on localhost unless explicitly enabled.
