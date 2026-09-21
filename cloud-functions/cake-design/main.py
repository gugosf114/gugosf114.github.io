"""Cake previews and reference-image edits for Quick Sketch and Cake Builder."""
import base64
import hashlib
import hmac
import io
import json
import os
import re
from datetime import datetime, timedelta, timezone

import functions_framework
import requests
from google.cloud import firestore
from PIL import Image, UnidentifiedImageError

ORIGINS = {
    "https://mybakingcreations.com", "https://www.mybakingcreations.com",
    "https://gugosf114.github.io", "https://abrahamyants.github.io",
    "https://raw.githack.com", "https://rawcdn.githack.com",
    "http://127.0.0.1:8766", "http://127.0.0.1:8765",
}
MODEL = os.environ.get("IMAGE_MODEL", "gemini-2.5-flash-image")
_db = None


class DesignError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def reserve(request):
    global _db
    if _db is None:
        _db = firestore.Client(project=os.environ.get("GOOGLE_CLOUD_PROJECT", "bakers-agent"))
    forwarded = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")
    ip = forwarded[-2 if len(forwarded) > 1 else -1].strip()
    visitor = hmac.new(os.environ["DESIGN_SIGNING_KEY"].encode(), ip.encode(), hashlib.sha256).hexdigest()
    now = datetime.now(timezone.utc)
    day = now.strftime("%Y-%m-%d")
    entries = [
        (_db.collection("cake_design_usage").document(day + "-" + visitor), 30),
        (_db.collection("cake_design_usage").document(day + "-total"), 1000),
    ]

    @firestore.transactional
    def increment(transaction):
        counts = [(ref, limit, (ref.get(transaction=transaction).to_dict() or {}).get("images", 0)) for ref, limit in entries]
        if any(count >= limit for _, limit, count in counts):
            raise DesignError("The drawing service has reached its preview allowance. Please try again later.", 429)
        for ref, _, count in counts:
            transaction.set(ref, {"images": count + 1, "expiresAt": now + timedelta(days=2)})
    increment(_db.transaction())


def image_part(value):
    if not isinstance(value, str) or len(value) > 12_000_000:
        raise DesignError("The previous picture is too large or unavailable. Generate a fresh design first.")
    match = re.fullmatch(r"data:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)", value)
    if not match:
        raise DesignError("The previous picture could not be read. Generate a fresh design first.")
    try:
        raw = base64.b64decode(match[2], validate=True)
        if len(raw) > 8_000_000:
            raise ValueError()
        with Image.open(io.BytesIO(raw)) as image:
            if image.width * image.height > 20_000_000:
                raise ValueError()
            actual = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp"}.get(image.format)
            if actual != match[1]:
                raise ValueError()
            image.verify()
    except (ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError):
        raise DesignError("The previous picture could not be read. Generate a fresh design first.")
    return {"inlineData": {"mimeType": match[1], "data": match[2]}}


def request_parts(body):
    if not isinstance(body, dict):
        raise DesignError("Please describe your design.")
    description = body.get("description", "")
    if not isinstance(description, str) or len(description.strip()) < 5 or len(description) > 12000:
        raise DesignError("Please describe your design in 5 to 12,000 characters.")
    operation = body.get("operation", "generate")
    if operation not in {"generate", "edit"}:
        raise DesignError("Choose a new design or a change to your existing design.")
    product = str(body.get("productType", "cake"))[:60]
    instruction = body.get("editInstruction", "")
    reference = body.get("referenceImage")
    context = json.dumps({"product": product, "full_design_brief": description}, ensure_ascii=False)
    if operation == "edit":
        if not isinstance(instruction, str) or not instruction.strip() or len(instruction) > 5000:
            raise DesignError("Tell us what to change in your design.")
        # Never silently fall back to text-only generation when an edit was requested.
        part = image_part(reference)
        prompt = (
            "Edit the supplied photograph of the customer's current approved design. "
            "It is the visual source of truth. Apply ONLY the requested change. Preserve all other "
            "details: cake silhouette, tier proportions, icing texture, decorations, colors, camera "
            "angle, placement, lighting and background. Do not invent a different cake or remove "
            "approved elements. If the change explicitly modifies one of those details, modify only "
            "that detail. The full brief is context, not permission to redraw unrelated parts. "
            "Render requested writing exactly as specified and keep existing writing otherwise. "
            "Return one edited image, not a collage or comparison. Requested change: "
            + instruction + "\nContext: " + context
        )
        return [part, {"text": prompt}], operation
    if reference:
        raise DesignError("Use edit mode when changing an existing design.")
    prompt = (
        "Create one professional bakery product photograph from this customer's design brief. "
        "Use realistic, achievable buttercream or fondant details, a clean light background and "
        "soft studio lighting. Include writing only when the customer requests it, using their "
        "exact words. Respect the requested product, shape, colors and tier count. "
        "Show one complete design, not separate panels. Brief: " + context
    )
    return [{"text": prompt}], operation


@functions_framework.http
def cake_design(request):
    origin = request.headers.get("Origin", "")
    headers = {"Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin"}
    if origin in ORIGINS:
        headers.update({"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type"})
    def reply(data, status=200):
        return json.dumps(data), status, headers
    if origin and origin not in ORIGINS:
        return reply({"error": "Please use the Design Studio on our website."}, 403)
    if request.method == "OPTIONS":
        return "", 204, headers
    if request.method == "GET":
        return reply({"service": "mbc-cake-design", "version": "image-edit-v1", "supportsReferenceImages": True, "model": MODEL})
    if request.method != "POST":
        return reply({"error": "Please send a design request."}, 405)
    try:
        if request.content_length and request.content_length > 13_000_000:
            raise DesignError("The previous picture is too large.", 413)
        parts, operation = request_parts(request.get_json(silent=True))
        reserve(request)
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
            headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"].strip(), "Content-Type": "application/json"},
            json={"contents": [{"role": "user", "parts": parts}], "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}},
            timeout=(10, 120),
        )
        if not response.ok:
            print(json.dumps({"event": "gemini_error", "status": response.status_code}))
            raise DesignError("The drawing service is busy. Please try again shortly.", 429 if response.status_code == 429 else 502)
        data = response.json()
        candidates = data.get("candidates") or []
        output = candidates[0].get("content", {}).get("parts", []) if candidates else []
        for part in output:
            image = part.get("inlineData", {})
            if not part.get("thought") and image.get("data") and image.get("mimeType", "").startswith("image/"):
                return reply({"success": True, "image": "data:" + image["mimeType"] + ";base64," + image["data"], "operation": operation})
        raise DesignError("That design could not be drawn. Try adjusting your description.", 422)
    except DesignError as error:
        return reply({"error": str(error)}, error.status)
    except requests.Timeout:
        return reply({"error": "That design took too long. Your previous picture is still available."}, 504)
    except Exception as error:
        print(json.dumps({"event": "cake_design_error", "type": type(error).__name__}))
        return reply({"error": "The drawing service is unavailable. Please try again shortly."}, 503)
