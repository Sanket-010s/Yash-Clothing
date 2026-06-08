import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "your_database_url")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_TOKEN_EXPIRE_HOURS: int = 24
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "your_razorpay_key_id")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "your_razorpay_key_secret")
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "your_sendgrid_api_key")
    BRAND_EMAIL_FROM: str = os.getenv("BRAND_EMAIL_FROM", "noreply@yourdomain.com")
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "your_cloud_name")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "your_cloudinary_api_key")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "your_cloudinary_api_secret")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    ADMIN_URL: str = os.getenv("ADMIN_URL", "http://localhost:5173")
    BRAND_NAME: str = os.getenv("BRAND_NAME", "Yash Collection")
    BRAND_ADDRESS: str = os.getenv("BRAND_ADDRESS", "A/p-Khubi, Tal-Karad, Dist-Satara, Pin-415108")
    BRAND_GST_NUMBER: str = os.getenv("BRAND_GST_NUMBER", "your_gst_number")


@lru_cache
def get_settings() -> Settings:
    return Settings()
