from __future__ import annotations

import os

from config import get_settings

settings = get_settings()

try:
    import cloudinary  # type: ignore
    import cloudinary.uploader  # type: ignore
except ImportError:  # pragma: no cover
    cloudinary = None

if cloudinary and settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def upload_pdf(local_path: str, public_id: str) -> str:
    if not cloudinary or not settings.CLOUDINARY_CLOUD_NAME:
        filename = os.path.basename(local_path)
        return f"https://example.com/invoices/{filename}"

    response = cloudinary.uploader.upload(
        local_path,
        public_id=public_id,
        resource_type="raw",
        folder="invoices",
    )
    return str(response.get("secure_url") or response.get("url"))
