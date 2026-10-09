from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Form, File, UploadFile, Response, Query, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import re
import base64
import binascii
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import hashlib
import json
import asyncio
import time

try:
    import resend
except ImportError:
    resend = None

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    genai = None
    genai_types = None


# =================== LOAD ENV ===================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# =================== LOGGING ===================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# =================== ENV ===================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-3.5-flash-lite").strip() or "gemini-3.5-flash-lite"
GEMINI_SEO_MODEL = os.getenv("GEMINI_SEO_MODEL", "gemini-3.5-flash-lite").strip() or "gemini-3.5-flash-lite"
# Preserve the exact Render/MongoDB environment contract used by the previously
# working DFAB deployment. Do not silently switch to another database name.
MONGO_URL = os.getenv("MONGO_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "").strip()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "").strip()
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL", "").strip()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "dfab@admin2026").strip()
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").strip()
ANALYTICS_TIMEZONE = "Asia/Kolkata"
# Use a fixed UTC+05:30 offset for MongoDB date operators. This keeps analytics
# working on Windows/Python installations that do not ship the IANA tz database.
ANALYTICS_MONGO_TIMEZONE = "+05:30"
try:
    ANALYTICS_TZ = ZoneInfo(ANALYTICS_TIMEZONE)
except ZoneInfoNotFoundError:
    ANALYTICS_TZ = timezone(timedelta(hours=5, minutes=30))
    logger.warning(
        "System timezone database is unavailable; analytics will use the fixed IST offset (+05:30)."
    )
ANALYTICS_SUMMARY_CACHE_TTL_SECONDS = 3.0
_analytics_summary_cache = {}

if not MONGO_URL:
    raise RuntimeError("MONGO_URL is missing in backend/.env / Render Environment")

if not DB_NAME:
    raise RuntimeError("DB_NAME is missing in backend/.env / Render Environment")

# =================== INIT CLIENTS ===================

client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=12000,
    connectTimeoutMS=12000,
    socketTimeoutMS=30000,
    retryReads=True,
    retryWrites=True,
)
db = client[DB_NAME]

gemini_client = None
if GEMINI_API_KEY and genai:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info(
            "Gemini client initialized (chat=%s, seo=%s)",
            GEMINI_CHAT_MODEL,
            GEMINI_SEO_MODEL,
        )
    except Exception as e:
        logger.warning(f"Gemini client initialization failed: {e}")
        gemini_client = None
else:
    logger.warning("Gemini not enabled. Missing package or API key.")

if resend and RESEND_API_KEY:
    try:
        resend.api_key = RESEND_API_KEY
        logger.info("Resend initialized successfully")
    except Exception as e:
        logger.warning(f"Resend initialization failed: {e}")
else:
    logger.warning("Resend not enabled. Missing package or API key.")

# =================== APP ===================

app = FastAPI()
api_router = APIRouter(prefix="/api")

DFAB_SYSTEM_MSG = """You are DFAB AI Assistant for DFAB Stainless System Pvt Ltd, an ISO 9001:2015 precision fabrication company in Peenya Industrial Area, Bengaluru.

Company facts: established 28 September 2018; address No: 3B/415, No-8 KIADB Main Road, Peenya Industrial Area, Bengaluru 560058; facility about 7000 sq ft with a 5-ton crane, 10+ TIG/MIG welding machines, and CNC/conventional machines. Services include sheet-metal fabrication, pressure-vessel fabrication, pipeline fabrication and 6G welding, stellite welding, die welding, custom fabrication, jigs and fixtures, precision machining, and new product/prototype development. Common materials include stainless steel, aluminium and carbon steel. Industries include energy, pharmaceuticals, locomotive, aeronautical, food/dairy and automotive.

Contact: 9187638186 | info@dfab.in | WhatsApp +91 9187638186.

Answer clearly and concisely from the company facts above and general manufacturing knowledge. For project pricing or quotations, ask the visitor to contact DFAB or submit an inquiry. Prefer 2-6 sentences or short bullets unless more detail is requested."""

# =================== MODELS ===================

class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    author: str = "DFAB Team"
    category: str
    image_url: Optional[str] = None
    tags: List[str] = []
    published: bool = True


class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    excerpt: str
    author: str
    category: str
    image_url: Optional[str] = None
    tags: List[str] = []
    published: bool
    created_at: datetime
    updated_at: datetime


class ProjectCreate(BaseModel):
    title: str
    desc: str
    img: str
    tag: Optional[str] = None
    featured: bool = False
    published: bool = True


class Project(BaseModel):
    id: str
    title: str
    desc: str
    img: str
    tag: Optional[str] = None
    featured: bool = False
    published: bool
    created_at: datetime
    updated_at: datetime


class AdminLogin(BaseModel):
    password: str


class AnalyticsViewCreate(BaseModel):
    path: str = Field(min_length=1, max_length=300)
    visitor_id: str = Field(min_length=1, max_length=120)
    referrer: str = Field(default="", max_length=1000)
    title: str = Field(default="DFAB", max_length=200)


class BrochureDownloadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    mobile: str = Field(min_length=10, max_length=15)
    path: str = Field(default="/", max_length=300)
    visitor_id: str = Field(default="anonymous", max_length=120)


class ChatMessage(BaseModel):
    session_id: str
    message: str


class SEOOptimizeRequest(BaseModel):
    path: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=10, max_length=100)
    description: str = Field(min_length=40, max_length=300)
    keywords: List[str] = Field(default_factory=list, max_length=20)
    content_summary: str = Field(min_length=20, max_length=3000)


class SEOOptimizeResponse(BaseModel):
    title: str
    description: str
    keywords: List[str]
    optimized: bool = False

# --- Add below your other models ---

class CareerCreate(BaseModel):
    title: str
    location: str
    type: str  # Full-time / Internship / Contract
    description: str
    requirements: List[str] = []
    published: bool = True


class Career(BaseModel):
    id: str
    title: str
    location: str
    type: str
    description: str
    requirements: List[str] = []
    published: bool
    created_at: datetime
    updated_at: datetime    


# =================== HELPERS ===================

def get_admin_token_value() -> str:
    return hashlib.sha256(f"dfab-secret-{ADMIN_PASSWORD}".encode()).hexdigest()


async def verify_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.split(" ", 1)[1].strip()
    if token != get_admin_token_value():
        raise HTTPException(status_code=401, detail="Invalid token")

    return token


def analytics_dimensions(value: datetime) -> dict:
    value = value.astimezone(ANALYTICS_TZ)
    return {
        "date_key": value.strftime("%Y-%m-%d"),
        "month_key": value.strftime("%Y-%m"),
        "year": value.year,
        "month": value.month,
        "day": value.day,
    }


def analytics_period_filter(
    period: str,
    date_value: Optional[str],
    month_value: Optional[str],
    year_value: Optional[int],
):
    period = (period or "all").strip().lower()
    if period not in {"all", "date", "month", "year"}:
        raise HTTPException(status_code=422, detail="Invalid analytics period")

    if period == "all":
        return {}, "All time", None, None

    try:
        if period == "date":
            if not date_value:
                raise ValueError("date is required")
            start = datetime.strptime(date_value, "%Y-%m-%d").replace(tzinfo=ANALYTICS_TZ)
            end = start + timedelta(days=1)
            label = start.strftime("%d %b %Y")
        elif period == "month":
            if not month_value:
                raise ValueError("month is required")
            start = datetime.strptime(month_value, "%Y-%m").replace(tzinfo=ANALYTICS_TZ)
            if start.month == 12:
                end = start.replace(year=start.year + 1, month=1)
            else:
                end = start.replace(month=start.month + 1)
            label = start.strftime("%B %Y")
        else:
            if not year_value:
                raise ValueError("year is required")
            start = datetime(year_value, 1, 1, tzinfo=ANALYTICS_TZ)
            end = datetime(year_value + 1, 1, 1, tzinfo=ANALYTICS_TZ)
            label = str(year_value)
    except (ValueError, TypeError):
        raise HTTPException(status_code=422, detail="Invalid analytics filter value")

    return {
        "created_at": {
            "$gte": start.astimezone(timezone.utc),
            "$lt": end.astimezone(timezone.utc),
        }
    }, label, start, end


def _normalize_datetime(value, fallback):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
        except ValueError:
            return fallback
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except (ValueError, OSError, OverflowError):
            return fallback
    return fallback


def _first_text(*values, default=""):
    for value in values:
        if value is None:
            continue
        if isinstance(value, str):
            text = value.strip()
            if text:
                return text
            continue
        if isinstance(value, (int, float)):
            return str(value)
    return default


def _image_text(value):
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        return _first_text(
            value.get("url"),
            value.get("src"),
            value.get("data_url"),
            value.get("data"),
        )
    if isinstance(value, list):
        for item in value:
            resolved = _image_text(item)
            if resolved:
                return resolved
    return ""


def _published_state(document: dict, *, missing_means_published: bool = True) -> bool:
    document = document or {}
    raw = None
    for key in ("published", "isPublished", "is_published", "active", "is_active"):
        if key in document:
            raw = document.get(key)
            break
    if raw is None and "status" in document:
        raw = document.get("status")
    if raw is None:
        return missing_means_published
    if isinstance(raw, bool):
        return raw
    if isinstance(raw, (int, float)):
        return raw != 0

    value = str(raw).strip().lower()
    if value in {"false", "0", "no", "off", "draft", "unpublished", "hidden", "inactive", "archived"}:
        return False
    if value in {"true", "1", "yes", "on", "published", "live", "active", "public"}:
        return True
    return missing_means_published


def normalize_blog_document(post: dict, image_override: Optional[str] = None) -> dict:
    """Normalize current and older MongoDB blog documents.

    Blog records have existed under a few field-name/date variants. Normalizing
    each record prevents one older document from failing the whole API response
    and keeps the public page/admin reading the exact same MongoDB collection.
    """
    post = dict(post or {})
    mongo_id = post.get("_id")
    generated_at = (
        mongo_id.generation_time
        if isinstance(mongo_id, ObjectId)
        else datetime.now(timezone.utc)
    )
    created_at = _normalize_datetime(
        post.get("created_at") or post.get("createdAt") or post.get("date"),
        generated_at,
    )
    updated_at = _normalize_datetime(
        post.get("updated_at") or post.get("updatedAt"),
        created_at,
    )

    stable_id = (
        post.get("id")
        or post.get("post_id")
        or post.get("slug")
        or (str(mongo_id) if mongo_id is not None else None)
        or str(uuid.uuid4())
    )
    content = _first_text(
        post.get("content"),
        post.get("body"),
        post.get("description"),
    )
    excerpt = _first_text(
        post.get("excerpt"),
        post.get("summary"),
        post.get("short_description"),
    )
    if not excerpt and content:
        excerpt = content[:240].strip()

    image = image_override if image_override is not None else ""
    if image_override is None:
        for candidate in (
            post.get("image_url"),
            post.get("image"),
            post.get("img"),
            post.get("thumbnail"),
            post.get("images"),
        ):
            image = _image_text(candidate)
            if image:
                break

    raw_tags = post.get("tags", [])
    if isinstance(raw_tags, str):
        tags = [item.strip() for item in raw_tags.split(",") if item.strip()]
    elif isinstance(raw_tags, list):
        tags = [str(item).strip() for item in raw_tags if str(item).strip()]
    else:
        tags = []

    return {
        "id": str(stable_id),
        "title": _first_text(post.get("title"), post.get("name"), default="DFAB Blog Post"),
        "content": content,
        "excerpt": excerpt,
        "author": _first_text(post.get("author"), post.get("created_by"), default="DFAB Team"),
        "category": _first_text(post.get("category"), post.get("tag"), post.get("type"), default="Fabrication"),
        "image_url": image or None,
        "tags": tags,
        "published": _published_state(post, missing_means_published=True),
        "created_at": created_at,
        "updated_at": updated_at,
    }


def blog_lookup_query(post_id: str) -> dict:
    clauses = [
        {"id": post_id},
        {"post_id": post_id},
        {"slug": post_id},
    ]
    try:
        clauses.append({"_id": ObjectId(post_id)})
    except Exception:
        pass
    return {"$or": clauses}



PROJECT_IMAGE_FIELDS = ("img", "image_url", "image", "thumbnail", "images")
BLOG_IMAGE_FIELDS = ("image_url", "image", "img", "thumbnail", "images")


def _media_exists_query(fields):
    return {
        "$or": [
            {field: {"$exists": True, "$nin": [None, ""]}}
            for field in fields
        ]
    }


def _without_fields_projection(fields):
    return {field: 0 for field in fields}


def _absolute_route_url(request: Request, route_name: str, **params) -> str:
    """Build a public backend URL while respecting Render/Vercel proxy headers."""
    return str(request.url_for(route_name, **params))


async def _lightweight_documents(collection, image_fields, limit=250):
    """Read card/post metadata without shipping base64 images in the JSON list.

    The admin historically stores uploaded images as data URLs in MongoDB. With
    several records, returning every base64 image inside one JSON response can
    make Render/browser requests large enough to time out. Metadata and image
    presence are fetched separately; image bytes are served by media endpoints.
    """
    metadata_task = collection.find(
        {}, _without_fields_projection(image_fields)
    ).sort("created_at", -1).to_list(limit)
    media_ids_task = collection.find(
        _media_exists_query(image_fields), {"_id": 1}
    ).to_list(limit)
    documents, media_docs = await asyncio.gather(metadata_task, media_ids_task)
    media_ids = {str(item.get("_id")) for item in media_docs if item.get("_id") is not None}
    return documents, media_ids


def _extract_media_value(document: dict, fields) -> str:
    for field in fields:
        media = _image_text((document or {}).get(field))
        if media:
            return media
    return ""


def _decode_data_image(value: str):
    if not isinstance(value, str):
        return None
    value = value.strip()
    match = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", value, re.DOTALL)
    if not match:
        return None
    media_type, encoded = match.groups()
    try:
        return media_type, base64.b64decode(encoded, validate=False)
    except (ValueError, binascii.Error):
        return None


def _media_response(value: str):
    if not value:
        raise HTTPException(status_code=404, detail="Image not found")

    decoded = _decode_data_image(value)
    if decoded:
        media_type, raw = decoded
        return Response(
            content=raw,
            media_type=media_type,
            headers={
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                "X-Content-Type-Options": "nosniff",
            },
        )

    if value.startswith("http://") or value.startswith("https://"):
        return RedirectResponse(
            url=value,
            status_code=307,
            headers={"Cache-Control": "public, max-age=3600"},
        )

    # Older records can contain a frontend-relative image path. Returning a
    # redirect keeps the stored value intact instead of mutating the database.
    if value.startswith("/"):
        return RedirectResponse(
            url=value,
            status_code=307,
            headers={"Cache-Control": "public, max-age=3600"},
        )

    # Last compatibility path for raw base64 strings saved without a data URL.
    try:
        raw = base64.b64decode(value, validate=True)
        return Response(
            content=raw,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except (ValueError, binascii.Error):
        raise HTTPException(status_code=404, detail="Image not found")


def _is_generated_media_url(value: str, media_kind: str) -> bool:
    if not isinstance(value, str):
        return False
    normalized = value.lower()
    return f"/api/media/{media_kind}/" in normalized


def parse_post(post: dict):
    # Retained for compatibility with older internal call sites.
    return normalize_blog_document(post)


def project_is_published(project: dict) -> bool:
    """Return stable publication state for current and legacy projects."""
    return _published_state(project, missing_means_published=True)


def normalize_project_document(project: dict, image_override: Optional[str] = None) -> dict:
    """Map current and legacy MongoDB project documents to one safe schema.

    The normalizer intentionally tolerates older field names and imperfect data
    types so one legacy record cannot make the entire published/admin project
    response fail validation.
    """
    project = dict(project or {})
    mongo_id = project.get("_id")

    generated_at = (
        mongo_id.generation_time
        if isinstance(mongo_id, ObjectId)
        else datetime.now(timezone.utc)
    )
    created_at = _normalize_datetime(project.get("created_at"), generated_at)
    updated_at = _normalize_datetime(project.get("updated_at"), created_at)

    stable_id = (
        project.get("id")
        or project.get("project_id")
        or project.get("slug")
        or (str(mongo_id) if mongo_id is not None else None)
        or str(uuid.uuid4())
    )

    image = image_override if image_override is not None else ""
    if image_override is None:
        for candidate in (
            project.get("img"),
            project.get("image_url"),
            project.get("image"),
            project.get("thumbnail"),
            project.get("images"),
        ):
            image = _image_text(candidate)
            if image:
                break

    featured_raw = project.get("featured", False)
    if isinstance(featured_raw, str):
        featured = featured_raw.strip().lower() in {"true", "1", "yes", "on", "featured"}
    else:
        featured = bool(featured_raw)

    return {
        "id": str(stable_id),
        "title": _first_text(project.get("title"), project.get("name"), default="DFAB Project"),
        "desc": _first_text(project.get("desc"), project.get("description"), project.get("content")),
        "img": image,
        "tag": _first_text(project.get("tag"), project.get("category"), project.get("type"), default="Project"),
        "featured": featured,
        "published": project_is_published(project),
        "created_at": created_at,
        "updated_at": updated_at,
    }


def project_lookup_query(project_id: str) -> dict:
    clauses = [
        {"id": project_id},
        {"project_id": project_id},
        {"slug": project_id},
    ]
    try:
        clauses.append({"_id": ObjectId(project_id)})
    except Exception:
        pass
    return {"$or": clauses}


def build_chat_prompt(previous_messages, latest_message):
    # Send only the latest two turns to Gemini. The full visible chat remains
    # stored in MongoDB, but short model context keeps input-token usage low.
    history_lines = []
    for msg in previous_messages[-4:]:
        role = "Assistant" if msg.get("role") == "assistant" else "User"
        content = re.sub(r"\s+", " ", str(msg.get("content", ""))).strip()[:600]
        if content:
            history_lines.append(f"{role}: {content}")

    question = re.sub(r"\s+", " ", str(latest_message)).strip()[:1200]
    if history_lines:
        return f"Recent conversation:\n{'\n'.join(history_lines)}\n\nCurrent question: {question}"
    return question


def get_local_chat_response(latest_message: str):
    """Answer frequent DFAB FAQs locally so those messages use zero AI tokens."""
    lower_msg = latest_message.lower()

    if any(term in lower_msg for term in [
        "what services", "services do you offer", "what do you do", "capabilities"
    ]):
        return (
            "DFAB provides sheet-metal fabrication, pressure vessels, pipeline fabrication, "
            "precision machining, stellite/die welding, custom fabrication, jigs and fixtures, "
            "and new product/prototype development."
        )

    if any(term in lower_msg for term in [
        "how do i get a quote", "get a quote", "quotation", "pricing", "price", "cost"
    ]):
        return (
            "For an accurate quotation, share your drawing, material, quantity and delivery requirement "
            "through the DFAB inquiry form, or contact 9187638186 / WhatsApp +91 9187638186."
        )

    if any(term in lower_msg for term in [
        "which industries", "industries do you serve", "what industries", "sectors do you serve"
    ]):
        return (
            "DFAB serves energy, pharmaceuticals, locomotive, aeronautical, food & dairy, "
            "and automotive industries."
        )

    if any(term in lower_msg for term in [
        "contact", "phone number", "email address", "whatsapp number"
    ]):
        return "You can reach DFAB at 9187638186, info@dfab.in, or WhatsApp +91 9187638186."

    return None


def _gemini_config(system_instruction: str, max_output_tokens: int, json_mode: bool = False):
    if not genai_types:
        return None

    kwargs = {
        "system_instruction": system_instruction,
        "max_output_tokens": max_output_tokens,
    }
    if json_mode:
        kwargs["response_mime_type"] = "application/json"

    # Gemini 3.x supports minimal thinking, which is appropriate for short
    # website chat and metadata generation and reduces unnecessary token use.
    try:
        level = getattr(getattr(genai_types, "ThinkingLevel", object), "MINIMAL", "MINIMAL")
        kwargs["thinking_config"] = genai_types.ThinkingConfig(thinking_level=level)
    except Exception:
        pass

    try:
        return genai_types.GenerateContentConfig(**kwargs)
    except Exception:
        kwargs.pop("thinking_config", None)
        return genai_types.GenerateContentConfig(**kwargs)


def _generate_gemini_text(model_candidates, contents, config):
    last_error = None

    for model_name in dict.fromkeys(model_candidates):
        if not model_name:
            continue
        try:
            request_kwargs = {"model": model_name, "contents": contents}
            if config is not None:
                request_kwargs["config"] = config
            response = gemini_client.models.generate_content(**request_kwargs)
            text = getattr(response, "text", None)
            if text:
                return text.strip(), model_name
            last_error = RuntimeError(f"Empty Gemini response from {model_name}")
        except Exception as exc:
            last_error = exc
            error_text = str(exc).lower()
            # Try another low-cost model only for model availability/access
            # errors; quota/key/network failures should fall back immediately.
            if not any(marker in error_text for marker in [
                "404", "not found", "unsupported", "model is not available", "model not available"
            ]):
                raise

    if last_error:
        raise last_error
    raise RuntimeError("No Gemini model configured")

def _clean_seo_text(value: str, max_len: int) -> str:
    cleaned = re.sub(r"\s+", " ", str(value or "")).strip()
    return cleaned[:max_len].strip()


def _extract_json_object(text: str):
    if not text:
        return None
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(cleaned[start:end + 1])
    except json.JSONDecodeError:
        return None


def _normalize_seo_result(payload: SEOOptimizeRequest, data: dict):
    title = _clean_seo_text(data.get("title") if isinstance(data, dict) else "", 70)
    description = _clean_seo_text(data.get("description") if isinstance(data, dict) else "", 180)
    raw_keywords = data.get("keywords", []) if isinstance(data, dict) else []

    if not (20 <= len(title) <= 70):
        title = payload.title.strip()[:70]
    if not (80 <= len(description) <= 180):
        description = payload.description.strip()[:180]

    keywords = []
    if isinstance(raw_keywords, list):
        for item in raw_keywords:
            keyword = _clean_seo_text(item, 60)
            if keyword and keyword.lower() not in {k.lower() for k in keywords}:
                keywords.append(keyword)
            if len(keywords) >= 12:
                break

    if not keywords:
        keywords = [_clean_seo_text(k, 60) for k in payload.keywords[:12] if _clean_seo_text(k, 60)]

    return {
        "title": title,
        "description": description,
        "keywords": keywords,
    }


def get_ai_seo_metadata(payload: SEOOptimizeRequest):
    fallback = {
        "title": payload.title.strip()[:70],
        "description": payload.description.strip()[:180],
        "keywords": [k.strip() for k in payload.keywords[:10] if k.strip()],
        "optimized": False,
    }

    if not gemini_client:
        return fallback

    compact_summary = re.sub(r"\s+", " ", payload.content_summary).strip()[:700]
    prompt = (
        f"Path: {payload.path}\n"
        f"Title: {payload.title}\n"
        f"Description: {payload.description}\n"
        f"Keywords: {', '.join(payload.keywords[:10])}\n"
        f"Trusted summary: {compact_summary}\n"
        "Return JSON with title, description, keywords. "
        "Title 45-65 characters preferred and <=70; description 130-165 preferred and <=180; "
        "use 6-10 specific search phrases. Use only supplied facts and do not invent claims."
    )
    system_instruction = (
        "Optimize factual SEO metadata for DFAB Stainless System Pvt Ltd in Bengaluru. "
        "Return JSON only with title, description and keywords."
    )

    try:
        config = _gemini_config(system_instruction, max_output_tokens=220, json_mode=True)
        text, used_model = _generate_gemini_text(
            [GEMINI_SEO_MODEL, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
            prompt,
            config,
        )
        parsed = _extract_json_object(text)
        if not parsed:
            return fallback
        normalized = _normalize_seo_result(payload, parsed)
        logger.info("AI SEO optimized %s with %s", payload.path, used_model)
        return {**normalized, "optimized": True}
    except Exception as e:
        logger.warning(f"AI SEO optimization failed for {payload.path}: {e}")
        return fallback

def get_fallback_response(latest_message: str) -> str:
    lower_msg = latest_message.lower()

    if any(term in lower_msg for term in ["service", "services", "offer", "do you do", "capabilit", "capability", "capabilities"]):
        return (
            "DFAB offers sheet metal fabrication, "
            "pressure vessel fabrication, "
            "pipeline fabrication, "
            "stellite welding, "
            "die welding, "
            "custom fabrication, "
            "jig and fixture development, "
            "precision machining, and new product development. "
            "For project-specific details, call 9187638186 or email info@dfab.in."
        )

    if any(term in lower_msg for term in ["contact", "phone", "email", "address", "location", "whatsapp"]):
        return (
            "You can reach DFAB at 9187638186, info@dfab.in, or WhatsApp +919187638186. "
            "The facility is in Peenya Industrial Area, Bengaluru."
        )

    if any(term in lower_msg for term in ["quote", "pricing", "price", "cost", "estimate", "quotation"]):
        return (
            "For pricing or a quotation, please contact DFAB directly at 9187638186 or "
            "WhatsApp +91 9187638186 so the team can review your fabrication requirement."
        )

    if any(term in lower_msg for term in ["industry", "industries", "sector", "sectors"]):
        return (
            "DFAB serves energy, "
            "pharmaceuticals, "
            "locomotive, "
            "aeronautical, "
            "food and dairy, "
            "and automotive industries."
        )

    if any(term in lower_msg for term in ["material", "materials", "stainless steel", "aluminium", "aluminum", "carbon steel", "ss"]):
        return (
            "DFAB works with stainless steel, "
            "aluminum, and carbon steel for fabrication, "
            "machining, and welding applications."
        )

    if any(term in lower_msg for term in ["welding", "tig", "mig", "arc welding", "pipeline", "pressure vessel"]):
        return (
            "DFAB provides TIG, MIG, arc welding, "
            "pipeline fabrication, "
            "pressure vessel fabrication, "
            "and custom industrial welding solutions."
        )

    return (
        "DFAB specializes in stainless steel fabrication, "
        "machining, welding, "
        "pressure vessels, "
        "pipeline work, and custom industrial project support. "
        "Tell us your requirement, or contact DFAB directly at 9187638186 for a quotation."
    )


def get_gemini_response(previous_messages, latest_message):
    local_answer = get_local_chat_response(latest_message)
    if local_answer:
        return local_answer, "local"

    if not gemini_client:
        logger.warning("Gemini client unavailable. Using fallback.")
        return get_fallback_response(latest_message), "fallback"

    try:
        prompt = build_chat_prompt(previous_messages, latest_message)
        config = _gemini_config(DFAB_SYSTEM_MSG, max_output_tokens=320, json_mode=False)
        text, used_model = _generate_gemini_text(
            [GEMINI_CHAT_MODEL, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
            prompt,
            config,
        )
        return text, used_model

    except Exception as e:
        error_text = str(e)
        logger.error(f"Gemini response failed: {e}", exc_info=True)

        if "429" in error_text or "resource_exhausted" in error_text.lower() or "quota" in error_text.lower():
            return (
                "Our AI assistant is temporarily busy. Here is a quick DFAB response:\n\n"
                + get_fallback_response(latest_message),
                "fallback",
            )

        return get_fallback_response(latest_message), "fallback"

def send_emails(name, email, phone, subject, message, attachment=None):
    try:
        if not resend:
            logger.warning("Resend package is not installed")
            return False

        if not RESEND_API_KEY:
            logger.warning("RESEND_API_KEY is missing")
            return False

        if not SENDER_EMAIL:
            logger.warning("SENDER_EMAIL is missing")
            return False

        if not RECEIVER_EMAIL:
            logger.warning("RECEIVER_EMAIL is missing")
            return False

        safe_phone = phone if phone else "Not provided"
        safe_message = message.replace("\n", "<br>")

        admin_payload = {
            "from": f"DFAB <{SENDER_EMAIL}>",
            "to": [RECEIVER_EMAIL],
            "subject": f"New Inquiry: {subject}",
            "reply_to": [email],
            "html": f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                <h2 style="color:#0A66C2;margin-bottom:16px;">New Contact Inquiry - DFAB Website</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Phone:</strong> {safe_phone}</p>
                <p><strong>Subject:</strong> {subject}</p>
                <p><strong>Message:</strong><br>{safe_message}</p>
                <hr style="margin:20px 0;">
                <p><strong>Reply directly to customer:</strong> {email}</p>
            </div>
            """,
            "text": (
                f"New Contact Inquiry - DFAB Website\n\n"
                f"Name: {name}\n"
                f"Email: {email}\n"
                f"Phone: {safe_phone}\n"
                f"Subject: {subject}\n\n"
                f"Message:\n{message}\n\n"
                f"Reply directly to customer: {email}"
            ),
        }

        if attachment:
            admin_payload["attachments"] = [attachment]

        admin_result = resend.Emails.send(admin_payload)
        logger.info(f"ADMIN MAIL: {admin_result}")

        user_payload = {
            "from": f"DFAB <{SENDER_EMAIL}>",
            "to": [email],
            "subject": "We received your inquiry",
            "reply_to": [RECEIVER_EMAIL],
            "html": f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                <h3>Hi {name},</h3>
                <p>Thank you for contacting DFAB.</p>
                <p>We received your request and will respond shortly.</p>
                <br>
                <p>DFAB Team</p>
            </div>
            """,
            "text": (
                f"Hi {name},\n\n"
                f"Thank you for contacting DFAB.\n"
                f"We received your request and will respond shortly.\n\n"
                f"DFAB Team"
            ),
        }

        user_result = resend.Emails.send(user_payload)
        logger.info(f"USER MAIL: {user_result}")

        return True

    except Exception as e:
        logger.error(f"EMAIL ERROR: {e}", exc_info=True)
        return False


# =================== ROUTES ===================

@api_router.get("/")
async def root():
    return {"message": "DFAB API Running"}


@api_router.get("/health")
async def health():
    mongo_connected = False
    projects_count = None
    blog_posts_count = None
    mongo_error = None
    try:
        await db.command("ping")
        mongo_connected = True
        projects_count, blog_posts_count = await asyncio.gather(
            db.projects.count_documents({}),
            db.blog_posts.count_documents({}),
        )
    except Exception as exc:
        mongo_error = str(exc)[:240]
        logger.error("MongoDB health check failed: %s", exc)

    return {
        "status": "ok" if mongo_connected else "degraded",
        "mongo": mongo_connected,
        "db_name": DB_NAME,
        "projects_count": projects_count,
        "blog_posts_count": blog_posts_count,
        "mongo_error": mongo_error,
        "gemini_enabled": bool(gemini_client),
        "resend_enabled": bool(resend and RESEND_API_KEY and SENDER_EMAIL and RECEIVER_EMAIL),
        "sender_email": SENDER_EMAIL,
        "receiver_email": RECEIVER_EMAIL,
        "cors_origins": CORS_ORIGINS,
    }


@api_router.post("/contact")
async def submit_contact(
    name: str = Form(...),
    email: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    phone: Optional[str] = Form(None),
    visitor_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    try:
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            raise HTTPException(status_code=422, detail="Invalid email address")

        attachment = None
        filename = None

        if file and file.filename:
            file_bytes = await file.read()
            filename = file.filename

            attachment = {
                "filename": filename,
                "content": base64.b64encode(file_bytes).decode("utf-8"),
            }

        doc = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "phone": phone,
            "visitor_id": (visitor_id or "").strip()[:120],
            "subject": subject,
            "message": message,
            "has_attachment": bool(attachment),
            "filename": filename,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        await db.contacts.insert_one(doc)

        email_sent = send_emails(
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message,
            attachment=attachment,
        )

        if not email_sent:
            logger.warning("Contact saved in DB, but email sending failed")

        return {
            "status": "success",
            "message": "Your inquiry has been submitted. We'll be in touch soon!",
            "email_sent": email_sent,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Contact submission failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit contact form")


@api_router.post("/seo/optimize", response_model=SEOOptimizeResponse)
async def optimize_seo(payload: SEOOptimizeRequest):
    if not payload.path.startswith("/"):
        raise HTTPException(status_code=422, detail="Invalid page path")

    normalized_path = payload.path.lower()
    allowed_static_paths = {
        "/",
        "/about",
        "/services",
        "/capabilities",
        "/quality",
        "/careers",
        "/projects",
        "/infrastructure",
        "/blog",
        "/contact",
    }
    is_blog_article = bool(re.fullmatch(r"/blog/[a-z0-9_-]{1,100}", normalized_path))
    if normalized_path not in allowed_static_paths and not is_blog_article:
        raise HTTPException(status_code=404, detail="SEO optimization is not enabled for this path")

    cache_source = json.dumps(
        {
            "path": payload.path,
            "title": payload.title,
            "description": payload.description,
            "keywords": payload.keywords,
            "content_summary": payload.content_summary,
        },
        sort_keys=True,
        ensure_ascii=True,
    )
    cache_key = hashlib.sha256(cache_source.encode("utf-8")).hexdigest()

    try:
        cached = await db.seo_metadata_cache.find_one({"cache_key": cache_key}, {"_id": 0})
        if cached and cached.get("result"):
            cached_result = cached["result"]
            if cached_result.get("optimized"):
                return SEOOptimizeResponse(**cached_result)

            # If Gemini was temporarily unavailable, reuse the deterministic
            # metadata briefly instead of retrying for every visitor.
            updated_at = cached.get("updated_at")
            if isinstance(updated_at, str):
                try:
                    updated_at = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                except ValueError:
                    updated_at = None
            if isinstance(updated_at, datetime):
                if updated_at.tzinfo is None:
                    updated_at = updated_at.replace(tzinfo=timezone.utc)
                if datetime.now(timezone.utc) - updated_at < timedelta(hours=6):
                    return SEOOptimizeResponse(**cached_result)
    except Exception as e:
        logger.warning(f"SEO cache lookup failed: {e}")

    result = await asyncio.to_thread(get_ai_seo_metadata, payload)

    try:
        await db.seo_metadata_cache.update_one(
            {"cache_key": cache_key},
            {
                "$set": {
                    "cache_key": cache_key,
                    "path": payload.path,
                    "result": result,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"SEO cache save failed: {e}")

    return SEOOptimizeResponse(**result)


@api_router.post("/chat")
async def chat_endpoint(msg: ChatMessage):
    try:
        clean_message = re.sub(r"\s+", " ", str(msg.message)).strip()[:1200]
        if not clean_message:
            raise HTTPException(status_code=422, detail="Message is required")

        session_doc = await db.chat_sessions.find_one(
            {"session_id": msg.session_id},
            {"_id": 0}
        )
        previous_messages = session_doc.get("messages", []) if session_doc else []

        assistant_text, response_mode = await asyncio.to_thread(
            get_gemini_response, previous_messages, clean_message
        )

        updated_messages = [
            *previous_messages,
            {"role": "user", "content": clean_message},
            {"role": "assistant", "content": assistant_text[:4000]},
        ][-12:]

        await db.chat_sessions.update_one(
            {"session_id": msg.session_id},
            {
                "$set": {
                    "messages": updated_messages,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            },
            upsert=True,
        )

        return {
            "response": assistant_text,
            "session_id": msg.session_id,
            "mode": response_mode,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Chat service failed")


@api_router.get("/blog/posts", response_model=List[BlogPost])
async def get_blog_posts(request: Request, response: Response):
    # MongoDB-only. Keep the JSON lightweight: uploaded images are stored as
    # base64 in legacy records and are served through /api/media/blogs/{id}.
    response.headers["Cache-Control"] = "no-store, max-age=0"
    posts, media_ids = await _lightweight_documents(db.blog_posts, BLOG_IMAGE_FIELDS)
    normalized = []
    for post in posts:
        mongo_id = str(post.get("_id")) if post.get("_id") is not None else ""
        preview = normalize_blog_document(post)
        image_url = (
            _absolute_route_url(request, "get_blog_media", post_id=preview["id"])
            if mongo_id in media_ids
            else ""
        )
        item = normalize_blog_document(post, image_override=image_url)
        if item["published"]:
            normalized.append(item)
    return normalized


@api_router.get("/blog/posts/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str, request: Request, response: Response):
    response.headers["Cache-Control"] = "no-store, max-age=0"
    post = await db.blog_posts.find_one(
        blog_lookup_query(post_id),
        _without_fields_projection(BLOG_IMAGE_FIELDS),
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    normalized = normalize_blog_document(post)
    if not normalized["published"]:
        raise HTTPException(status_code=404, detail="Post not found")

    has_media = await db.blog_posts.find_one(
        {"$and": [blog_lookup_query(post_id), _media_exists_query(BLOG_IMAGE_FIELDS)]},
        {"_id": 1},
    )
    image_url = (
        _absolute_route_url(request, "get_blog_media", post_id=normalized["id"])
        if has_media
        else ""
    )
    return normalize_blog_document(post, image_override=image_url)


@api_router.get("/media/blogs/{post_id}", name="get_blog_media")
async def get_blog_media(post_id: str):
    projection = {field: 1 for field in BLOG_IMAGE_FIELDS}
    post = await db.blog_posts.find_one(blog_lookup_query(post_id), projection)
    if not post:
        raise HTTPException(status_code=404, detail="Post image not found")
    return _media_response(_extract_media_value(post, BLOG_IMAGE_FIELDS))


@api_router.post("/analytics/view")
async def record_site_view(event: AnalyticsViewCreate):
    # Anonymous page-view tracking only. No IP address or hidden personal
    # identity is persisted for ordinary website visitors.
    path = event.path.strip() or "/"
    if path.startswith("/admin") or path.startswith("/blog/admin") or path.startswith("/careers/admin"):
        return {"status": "ignored"}

    now = datetime.now(timezone.utc)
    await db.site_views.insert_one({
        "id": str(uuid.uuid4()),
        "path": path[:300],
        "visitor_id": event.visitor_id.strip()[:120],
        "referrer": event.referrer.strip()[:1000],
        "title": event.title.strip()[:200],
        "created_at": now,
        **analytics_dimensions(now),
    })
    _analytics_summary_cache.clear()
    return {"status": "ok"}


@api_router.post("/analytics/brochure-download")
async def record_brochure_download(event: BrochureDownloadCreate):
    email = event.email.strip().lower()
    mobile = re.sub(r"\D", "", event.mobile)

    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(status_code=422, detail="Invalid email")
    if len(mobile) != 10:
        raise HTTPException(status_code=422, detail="Invalid mobile number")

    now = datetime.now(timezone.utc)
    doc = {
        "id": str(uuid.uuid4()),
        "name": event.name.strip()[:120],
        "email": email[:254],
        "mobile": mobile,
        "path": (event.path.strip() or "/")[:300],
        "visitor_id": (event.visitor_id.strip() or "anonymous")[:120],
        "created_at": now,
        **analytics_dimensions(now),
    }
    await db.brochure_downloads.insert_one(doc)
    _analytics_summary_cache.clear()
    return {"status": "recorded"}


@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"token": get_admin_token_value()}


@api_router.get("/admin/analytics/summary")
async def admin_analytics_summary(
    period: str = Query("all"),
    date_value: Optional[str] = Query(None, alias="date"),
    month_value: Optional[str] = Query(None, alias="month"),
    year_value: Optional[int] = Query(None, alias="year", ge=2000, le=2100),
    token: str = Depends(verify_admin),
):
    # One compact aggregation per analytics collection. This replaces the old
    # chain of sequential MongoDB requests and keeps the dashboard responsive
    # even when Atlas has network latency.
    normalized_period = (period or "all").strip().lower()
    period_filter, period_label, period_start, period_end = analytics_period_filter(
        normalized_period, date_value, month_value, year_value
    )

    cache_key = f"{normalized_period}|{date_value or ''}|{month_value or ''}|{year_value or ''}"
    cached = _analytics_summary_cache.get(cache_key)
    now_monotonic = time.monotonic()
    if cached and now_monotonic - cached[0] < ANALYTICS_SUMMARY_CACHE_TTL_SECONDS:
        return cached[1]

    if normalized_period == "date":
        trend_expr = {
            "$dateToString": {
                "format": "%H",
                "date": "$created_at",
                "timezone": ANALYTICS_MONGO_TIMEZONE,
            }
        }
        trend_title = f"Traffic — {period_label}"
        trend_keys = [f"{hour:02d}" for hour in range(24)]
        trend_labels = {key: f"{key}:00" for key in trend_keys}
    elif normalized_period == "month":
        trend_expr = {
            "$dateToString": {
                "format": "%Y-%m-%d",
                "date": "$created_at",
                "timezone": ANALYTICS_MONGO_TIMEZONE,
            }
        }
        trend_title = f"Traffic — {period_label}"
        day_count = (period_end - period_start).days if period_start and period_end else 0
        trend_keys = [
            (period_start + timedelta(days=i)).strftime("%Y-%m-%d")
            for i in range(day_count)
        ]
        trend_labels = {
            key: datetime.strptime(key, "%Y-%m-%d").strftime("%d")
            for key in trend_keys
        }
    elif normalized_period == "year":
        trend_expr = {
            "$dateToString": {
                "format": "%Y-%m",
                "date": "$created_at",
                "timezone": ANALYTICS_MONGO_TIMEZONE,
            }
        }
        trend_title = f"Traffic — {period_label}"
        selected_year = period_start.year if period_start else datetime.now(ANALYTICS_TZ).year
        trend_keys = [f"{selected_year}-{month:02d}" for month in range(1, 13)]
        trend_labels = {
            key: datetime.strptime(key, "%Y-%m").strftime("%b")
            for key in trend_keys
        }
    else:
        # All-time graph is derived only from the full selected dataset. It is
        # not a rolling/fixed-day window.
        trend_expr = {
            "$dateToString": {
                "format": "%Y-%m",
                "date": "$created_at",
                "timezone": ANALYTICS_MONGO_TIMEZONE,
            }
        }
        trend_title = "All Time Traffic"
        trend_keys = None
        trend_labels = {}

    match_stage = [{"$match": period_filter}] if period_filter else []

    site_pipeline = match_stage + [
        {
            "$facet": {
                "metrics": [{"$count": "total"}],
                "unique_visitors": [
                    {"$match": {"visitor_id": {"$nin": [None, ""]}}},
                    {"$group": {"_id": "$visitor_id"}},
                    {"$count": "total"},
                ],
                "popular_pages": [
                    {"$group": {"_id": "$path", "views": {"$sum": 1}}},
                    {"$sort": {"views": -1}},
                    {"$limit": 8},
                ],
                "trend": [
                    {"$match": {"created_at": {"$type": "date"}}},
                    {"$group": {"_id": trend_expr, "views": {"$sum": 1}}},
                    {"$sort": {"_id": 1}},
                ],
                "recent_views": [
                    {"$sort": {"created_at": -1}},
                    {"$limit": 50},
                    {"$project": {
                        "_id": 0, "id": 1, "path": 1, "visitor_id": 1,
                        "referrer": 1, "created_at": 1, "date_key": 1,
                        "month_key": 1, "year": 1, "month": 1, "day": 1,
                    }},
                ],
            }
        }
    ]

    brochure_pipeline = match_stage + [
        {
            "$facet": {
                "metrics": [{"$count": "total"}],
                "recent_downloads": [
                    {"$sort": {"created_at": -1}},
                    {"$limit": 50},
                    {"$project": {
                        "_id": 0, "id": 1, "name": 1, "email": 1,
                        "mobile": 1, "path": 1, "created_at": 1,
                        "date_key": 1, "month_key": 1, "year": 1,
                        "month": 1, "day": 1,
                    }},
                ],
            }
        }
    ]

    site_result_task = db.site_views.aggregate(site_pipeline).to_list(1)
    brochure_result_task = db.brochure_downloads.aggregate(brochure_pipeline).to_list(1)
    site_docs, brochure_docs = await asyncio.gather(site_result_task, brochure_result_task)

    site_data = site_docs[0] if site_docs else {}
    brochure_data = brochure_docs[0] if brochure_docs else {}
    site_metrics = (site_data.get("metrics") or [{}])[0]
    unique_metrics = (site_data.get("unique_visitors") or [{}])[0]
    brochure_metrics = (brochure_data.get("metrics") or [{}])[0]

    total_views = int(site_metrics.get("total", 0) or 0)
    unique_visitors = int(unique_metrics.get("total", 0) or 0)
    brochure_downloads = int(brochure_metrics.get("total", 0) or 0)

    raw_trend = site_data.get("trend") or []
    trend_lookup = {str(row.get("_id")): int(row.get("views", 0) or 0) for row in raw_trend}

    if trend_keys is None:
        # All-time: use every month that actually exists in the selected MongoDB
        # data, with no artificial rolling-window label.
        trend_keys = [str(row.get("_id")) for row in raw_trend if row.get("_id")]
        trend_labels = {
            key: datetime.strptime(key, "%Y-%m").strftime("%b %Y")
            for key in trend_keys
        }

    trend_views = [
        {"date": key, "label": trend_labels.get(key, key), "views": trend_lookup.get(key, 0)}
        for key in trend_keys
    ]

    result = {
        "period": normalized_period,
        "period_label": period_label,
        "range_start": period_start,
        "range_end": period_end,
        "total_views": total_views,
        "unique_visitors": unique_visitors,
        "views_today": 0,
        "brochure_downloads": brochure_downloads,
        "brochure_downloads_today": 0,
        "popular_pages": [
            {"path": row.get("_id") or "/", "views": int(row.get("views", 0) or 0)}
            for row in (site_data.get("popular_pages") or [])
        ],
        "daily_views": trend_views,
        "trend_views": trend_views,
        "trend_title": trend_title,
        "recent_brochure_downloads": brochure_data.get("recent_downloads") or [],
        "recent_views": site_data.get("recent_views") or [],
    }

    _analytics_summary_cache[cache_key] = (now_monotonic, result)
    return result


@api_router.get("/admin/blog/posts", response_model=List[BlogPost])
async def admin_get_posts(request: Request, response: Response, token: str = Depends(verify_admin)):
    response.headers["Cache-Control"] = "no-store, max-age=0"
    posts, media_ids = await _lightweight_documents(db.blog_posts, BLOG_IMAGE_FIELDS)
    results = []
    for post in posts:
        mongo_id = str(post.get("_id")) if post.get("_id") is not None else ""
        base = normalize_blog_document(post)
        image_url = (
            _absolute_route_url(request, "get_blog_media", post_id=base["id"])
            if mongo_id in media_ids
            else ""
        )
        results.append(normalize_blog_document(post, image_override=image_url))
    return results


@api_router.post("/admin/blog/posts", response_model=BlogPost)
async def create_blog_post(request: Request, post: BlogPostCreate, token: str = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    blog_post = {
        "id": str(uuid.uuid4()),
        **post.model_dump(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.blog_posts.insert_one(blog_post)
    image_url = (
        _absolute_route_url(request, "get_blog_media", post_id=blog_post["id"])
        if _extract_media_value(blog_post, BLOG_IMAGE_FIELDS)
        else ""
    )
    return normalize_blog_document(blog_post, image_override=image_url)


@api_router.put("/admin/blog/posts/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, request: Request, post: BlogPostCreate, token: str = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    query = blog_lookup_query(post_id)
    updated = {**post.model_dump(), "id": post_id, "updated_at": now.isoformat()}

    # Admin lists now receive a lightweight media URL rather than the original
    # base64. If the image was not changed, preserve the existing MongoDB image.
    if _is_generated_media_url(updated.get("image_url", ""), "blogs"):
        updated.pop("image_url", None)

    result = await db.blog_posts.update_one(query, {"$set": updated})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    updated_post = await db.blog_posts.find_one(query)
    image_url = (
        _absolute_route_url(request, "get_blog_media", post_id=post_id)
        if _extract_media_value(updated_post, BLOG_IMAGE_FIELDS)
        else ""
    )
    return normalize_blog_document(updated_post, image_override=image_url)


@api_router.delete("/admin/blog/posts/{post_id}")
async def delete_blog_post(post_id: str, token: str = Depends(verify_admin)):
    result = await db.blog_posts.delete_one(blog_lookup_query(post_id))
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": "deleted"}


# =================== PROJECT ROUTES ===================

@api_router.get("/projects", response_model=List[Project])
async def get_projects(request: Request, response: Response):
    # MongoDB-only. Keep card JSON small even when admin uploads large images.
    response.headers["Cache-Control"] = "no-store, max-age=0"
    projects, media_ids = await _lightweight_documents(db.projects, PROJECT_IMAGE_FIELDS)
    results = []
    for project in projects:
        mongo_id = str(project.get("_id")) if project.get("_id") is not None else ""
        base = normalize_project_document(project)
        image_url = (
            _absolute_route_url(request, "get_project_media", project_id=base["id"])
            if mongo_id in media_ids
            else ""
        )
        item = normalize_project_document(project, image_override=image_url)
        if item["published"]:
            results.append(item)
    return results


@api_router.get("/media/projects/{project_id}", name="get_project_media")
async def get_project_media(project_id: str):
    projection = {field: 1 for field in PROJECT_IMAGE_FIELDS}
    project = await db.projects.find_one(project_lookup_query(project_id), projection)
    if not project:
        raise HTTPException(status_code=404, detail="Project image not found")
    return _media_response(_extract_media_value(project, PROJECT_IMAGE_FIELDS))


@api_router.get("/admin/projects", response_model=List[Project])
async def admin_get_projects(request: Request, response: Response, token: str = Depends(verify_admin)):
    response.headers["Cache-Control"] = "no-store, max-age=0"
    projects, media_ids = await _lightweight_documents(db.projects, PROJECT_IMAGE_FIELDS)
    results = []
    for project in projects:
        mongo_id = str(project.get("_id")) if project.get("_id") is not None else ""
        base = normalize_project_document(project)
        image_url = (
            _absolute_route_url(request, "get_project_media", project_id=base["id"])
            if mongo_id in media_ids
            else ""
        )
        results.append(normalize_project_document(project, image_override=image_url))
    return results


@api_router.post("/admin/projects", response_model=Project)
async def create_project(request: Request, project: ProjectCreate, token: str = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    new_project = {
        "id": str(uuid.uuid4()),
        **project.model_dump(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.projects.insert_one(new_project)
    image_url = (
        _absolute_route_url(request, "get_project_media", project_id=new_project["id"])
        if _extract_media_value(new_project, PROJECT_IMAGE_FIELDS)
        else ""
    )
    return normalize_project_document(new_project, image_override=image_url)


@api_router.put("/admin/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, request: Request, project: ProjectCreate, token: str = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    query = project_lookup_query(project_id)
    updated = {
        **project.model_dump(),
        "id": project_id,
        "updated_at": now.isoformat(),
    }

    # Preserve the stored image when an admin edits text/featured state without
    # choosing a new file. The list endpoint intentionally returns a media URL.
    if _is_generated_media_url(updated.get("img", ""), "projects"):
        updated.pop("img", None)

    result = await db.projects.update_one(query, {"$set": updated})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    updated_project = await db.projects.find_one(query)
    image_url = (
        _absolute_route_url(request, "get_project_media", project_id=project_id)
        if _extract_media_value(updated_project, PROJECT_IMAGE_FIELDS)
        else ""
    )
    return normalize_project_document(updated_project, image_override=image_url)


@api_router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str, token: str = Depends(verify_admin)):
    result = await db.projects.delete_one(project_lookup_query(project_id))
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "deleted"}


# =================== CAREERS ROUTES ===================

@api_router.get("/careers", response_model=List[Career])
async def get_careers():
    items = await db.careers.find({"published": True}, {"_id": 0}) \
                            .sort("created_at", -1).to_list(100)
    return [parse_post(i) for i in items]


@api_router.get("/admin/careers", response_model=List[Career])
async def admin_get_careers(token: str = Depends(verify_admin)):
    items = await db.careers.find({}, {"_id": 0}) \
                            .sort("created_at", -1).to_list(100)
    return [parse_post(i) for i in items]


@api_router.post("/admin/careers", response_model=Career)
async def create_career(career: CareerCreate, token: str = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    doc = {
        "id": str(uuid.uuid4()),
        **career.model_dump(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.careers.insert_one(doc)
    doc["created_at"] = now
    doc["updated_at"] = now
    return doc


@api_router.put("/admin/careers/{career_id}", response_model=Career)
async def update_career(career_id: str, career: CareerCreate, token: str = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    updated = {**career.model_dump(), "updated_at": now.isoformat()}
    result = await db.careers.update_one({"id": career_id}, {"$set": updated})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Career not found")

    doc = await db.careers.find_one({"id": career_id}, {"_id": 0})
    return parse_post(doc)


@api_router.delete("/admin/careers/{career_id}")
async def delete_career(career_id: str, token: str = Depends(verify_admin)):
    result = await db.careers.delete_one({"id": career_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Career not found")
    return {"status": "deleted"}


# =================== APP SETUP ===================

app.include_router(api_router)

# CORS supports production domains, Vercel previews, localhost, and private LAN
# development addresses such as http://192.168.1.55:3000.
LOCAL_AND_DEPLOYMENT_ORIGIN_REGEX = (
    r"^(?:"
    r"https?://localhost(?::\d+)?"
    r"|https?://127\.0\.0\.1(?::\d+)?"
    r"|https?://192\.168(?:\.\d{1,3}){2}(?::\d+)?"
    r"|https?://10(?:\.\d{1,3}){3}(?::\d+)?"
    r"|https?://172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}(?::\d+)?"
    r"|https://[A-Za-z0-9-]+\.vercel\.app"
    r")$"
)

if CORS_ORIGINS == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=86400,
    )
    logger.info("CORS enabled in wildcard mode")
else:
    allowed_origins = [
        origin.strip().rstrip("/")
        for origin in CORS_ORIGINS.split(",")
        if origin.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=LOCAL_AND_DEPLOYMENT_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=86400,
    )
    logger.info(
        "CORS enabled for explicit origins plus localhost/LAN/Vercel previews: %s",
        allowed_origins,
    )


@app.on_event("startup")
async def ensure_analytics_indexes():
    try:
        await db.site_views.create_index([("created_at", -1)])
        await db.site_views.create_index([("created_at", 1), ("visitor_id", 1)])
        await db.site_views.create_index([("created_at", 1), ("path", 1)])
        await db.site_views.create_index("visitor_id")
        await db.site_views.create_index("path")
        await db.site_views.create_index([("year", 1), ("month", 1), ("day", 1)])
        await db.site_views.create_index("date_key")
        await db.site_views.create_index("month_key")
        await db.brochure_downloads.create_index([("created_at", -1)])
        await db.brochure_downloads.create_index("email")
        await db.brochure_downloads.create_index("visitor_id")
        await db.contacts.create_index("visitor_id")
        await db.brochure_downloads.create_index([("year", 1), ("month", 1), ("day", 1)])
        await db.brochure_downloads.create_index("date_key")
        await db.brochure_downloads.create_index("month_key")

        # Backfill date dimensions for analytics records created before the
        # date/month/year filters were introduced. Existing data remains intact.
        for collection in (db.site_views, db.brochure_downloads):
            await collection.update_many(
                {
                    "created_at": {"$type": "date"},
                    "$or": [
                        {"date_key": {"$exists": False}},
                        {"month_key": {"$exists": False}},
                        {"year": {"$exists": False}},
                    ],
                },
                [
                    {
                        "$set": {
                            "date_key": {
                                "$dateToString": {
                                    "format": "%Y-%m-%d",
                                    "date": "$created_at",
                                    "timezone": ANALYTICS_MONGO_TIMEZONE,
                                }
                            },
                            "month_key": {
                                "$dateToString": {
                                    "format": "%Y-%m",
                                    "date": "$created_at",
                                    "timezone": ANALYTICS_MONGO_TIMEZONE,
                                }
                            },
                            "year": {
                                "$year": {"date": "$created_at", "timezone": ANALYTICS_MONGO_TIMEZONE}
                            },
                            "month": {
                                "$month": {"date": "$created_at", "timezone": ANALYTICS_MONGO_TIMEZONE}
                            },
                            "day": {
                                "$dayOfMonth": {"date": "$created_at", "timezone": ANALYTICS_MONGO_TIMEZONE}
                            },
                        }
                    }
                ],
            )
    except Exception as exc:
        logger.warning(f"Analytics index/setup skipped: {exc}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
