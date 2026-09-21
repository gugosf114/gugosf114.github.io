"""Private reference-file storage for the existing Web3Forms quote delivery path."""
import hashlib
import hmac
import json
import mimetypes
import os
import re
import time
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import quote, urlencode

import functions_framework
from google.api_core.exceptions import NotFound, PreconditionFailed
from google.cloud import firestore, storage

ORIGINS = {
    "https://mybakingcreations.com", "https://www.mybakingcreations.com",
    "https://gugosf114.github.io", "http://127.0.0.1:8766",
}
MAX_FILE = 5 * 1024 * 1024
PUBLIC_URL = "https://us-central1-bakers-agent.cloudfunctions.net/mbc-quote-references-v1"
_db = None
_storage = None


class UploadError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def signing_key():
    return os.environ["REFERENCE_SIGNING_KEY"].strip().encode()


def signature(path, expires):
    return hmac.new(signing_key(), (path + ":" + str(expires)).encode(), hashlib.sha256).hexdigest()


def bucket():
    global _storage
    if _storage is None:
        _storage = storage.Client(project="bakers-agent")
    return _storage.bucket(os.environ["REFERENCE_BUCKET"])


def reserve(request, request_id, fingerprint):
    """Durable idempotency and upload budgets; no customer contact data is stored here."""
    global _db
    if _db is None:
        _db = firestore.Client(project="bakers-agent")
    now = datetime.now(timezone.utc)
    forwarded = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")
    ip = forwarded[-2 if len(forwarded) > 1 else -1].strip()
    visitor = hmac.new(signing_key(), ip.encode(), hashlib.sha256).hexdigest()
    batch = _db.collection("quote_reference_batches").document(request_id)
    day = now.strftime("%Y-%m-%d")
    limits = [
        (_db.collection("quote_reference_usage").document(day + "-" + visitor), 30),
        (_db.collection("quote_reference_usage").document(day + "-total"), 1000),
    ]

    @firestore.transactional
    def transaction_body(transaction):
        previous = batch.get(transaction=transaction).to_dict()
        if previous:
            if previous["fingerprint"] != fingerprint:
                raise UploadError("The reference files changed. Please try sending the updated request again.", 409)
            return previous["downloadExpires"]
        counts = [(ref, limit, (ref.get(transaction=transaction).to_dict() or {}).get("batches", 0)) for ref, limit in limits]
        if any(count >= limit for _, limit, count in counts):
            raise UploadError("Reference uploads are busy. Your draft is saved; please try again later.", 429)
        expires = int((now + timedelta(days=365)).timestamp())
        transaction.set(batch, {"fingerprint": fingerprint, "downloadExpires": expires, "createdAt": now})
        for ref, _, count in counts:
            transaction.set(ref, {"batches": count + 1, "expiresAt": now + timedelta(days=2)})
        return expires

    return transaction_body(_db.transaction())


def read_files(request):
    parts = request.files.getlist("files")
    if not 1 <= len(parts) <= 3:
        raise UploadError("Choose up to three reference files.")
    result = []
    for item in parts:
        name = (item.filename or "reference").replace("\\", "/").rsplit("/", 1)[-1]
        name = name.replace("\r", "").replace("\n", "").replace("\x00", "")[:180] or "reference"
        mime = item.mimetype or mimetypes.guess_type(name)[0] or "application/octet-stream"
        allowed = mime.startswith("image/") or mime == "application/pdf" or name.lower().endswith((".heic", ".heif", ".pdf"))
        if not allowed:
            raise UploadError("Reference files must be images or PDFs.")
        data = item.read(MAX_FILE + 1)
        if not data or len(data) > MAX_FILE:
            raise UploadError("Each reference file must be nonempty and no larger than 5 MB.")
        result.append({"name": name, "mime": mime, "data": data, "sha": hashlib.sha256(data).hexdigest()})
    return result


@functions_framework.http
def quote_references(request):
    origin = request.headers.get("Origin", "")
    headers = {"Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin"}
    if origin in ORIGINS:
        headers.update({"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type"})
    def reply(data, status=200):
        return json.dumps(data), status, headers
    if request.method == "OPTIONS":
        return "", 204 if origin in ORIGINS else 403, headers
    try:
        if request.method == "GET" and request.args.get("file"):
            path = request.args["file"]
            if not re.fullmatch(r"[0-9a-f-]{36}/[0-2]-[0-9a-f]{64}", path):
                raise UploadError("This reference link is invalid.", 404)
            try:
                expires = int(request.args.get("expires", "0"))
            except ValueError:
                raise UploadError("This reference link is invalid.", 404)
            if not hmac.compare_digest(signature(path, expires), request.args.get("signature", "")):
                raise UploadError("This reference link is invalid.", 403)
            if expires < time.time():
                raise UploadError("This reference link has expired. Please contact My Baking Creations.", 410)
            blob = bucket().blob(path)
            blob.reload()
            name = (blob.metadata or {}).get("original_name", "reference")
            return blob.download_as_bytes(), 200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename*=UTF-8''" + quote(name, safe=""),
                "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store",
                "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow, noarchive",
            }
        if request.method == "GET":
            return reply({"service": "mbc-quote-references", "version": "1", "privateReferences": True})
        if request.method != "POST":
            raise UploadError("Please upload reference files from the quote form.", 405)
        if origin not in ORIGINS:
            raise UploadError("Please use the quote form on our website.", 403)
        if request.content_length and request.content_length > 16 * 1024 * 1024:
            raise UploadError("Choose up to three files, no larger than 5 MB each.", 413)
        request_id = request.form.get("request_id", "")
        try:
            if str(uuid.UUID(request_id)) != request_id:
                raise ValueError()
        except ValueError:
            raise UploadError("Please refresh the quote form and try again.")
        files = read_files(request)
        fingerprint = hashlib.sha256(json.dumps([(f["name"], f["sha"]) for f in files]).encode()).hexdigest()
        expires = reserve(request, request_id, fingerprint)
        references = []
        for index, item in enumerate(files):
            path = request_id + "/" + str(index) + "-" + item["sha"]
            blob = bucket().blob(path)
            blob.metadata = {"original_name": item["name"], "source_mime": item["mime"]}
            try:
                blob.upload_from_string(item["data"], content_type="application/octet-stream", if_generation_match=0, timeout=45)
            except PreconditionFailed:
                pass  # An identical retry reuses the existing private object.
            url = PUBLIC_URL + "?" + urlencode({"file": path, "expires": expires, "signature": signature(path, expires)})
            references.append({"name": item["name"], "url": url, "size": len(item["data"])})
        return reply({"success": True, "references": references})
    except UploadError as error:
        return reply({"error": str(error)}, error.status)
    except NotFound:
        return reply({"error": "This reference file could not be found."}, 404)
    except Exception as error:
        print(json.dumps({"event": "quote_reference_error", "type": type(error).__name__}))
        return reply({"error": "Your references could not be uploaded just now. Your draft is saved; please try again."}, 503)
