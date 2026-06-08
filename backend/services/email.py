from __future__ import annotations

import base64
from pathlib import Path

from config import get_settings

settings = get_settings()

try:
    from sendgrid import SendGridAPIClient  # type: ignore
    from sendgrid.helpers.mail import (  # type: ignore
        Attachment,
        Disposition,
        FileContent,
        FileName,
        FileType,
        Mail,
    )
except ImportError:  # pragma: no cover
    SendGridAPIClient = None


def send_order_confirmation_email(
    to_email: str,
    subject: str,
    plain_body: str,
    invoice_path: str | None = None,
) -> bool:
    if not settings.SENDGRID_API_KEY or not SendGridAPIClient:
        return False

    from_email = settings.BRAND_EMAIL_FROM or "no-reply@example.com"
    message = Mail(from_email=from_email, to_emails=to_email, subject=subject, plain_text_content=plain_body)

    if invoice_path:
        path = Path(invoice_path)
        if path.exists():
            encoded = base64.b64encode(path.read_bytes()).decode()
            attachment = Attachment(
                FileContent(encoded),
                FileName(path.name),
                FileType("application/pdf"),
                Disposition("attachment"),
            )
            message.attachment = attachment

    try:
        client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        client.send(message)
        return True
    except Exception:
        return False
