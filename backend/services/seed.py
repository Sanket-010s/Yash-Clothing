from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.product import Product, Variant
from models.user import User
from services.security import hash_password

SAMPLE_PRODUCTS = [
    {
        "name": "Classic Black Tee",
        "description": "Soft cotton black tee with minimalist fit.",
        "base_price": 799,
        "sale_price": 499,
        "category": "Basics",
        "images": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
        ],
        "variants": [
            {"size": "M", "color": "Black", "color_hex": "#000000", "stock": 20},
            {"size": "L", "color": "Black", "color_hex": "#000000", "stock": 20},
        ],
    },
]


async def seed_admin_if_not_exists(db: AsyncSession) -> None:
    """Create demo admin user if it doesn't exist"""
    result = await db.execute(select(User).where(User.email == "admin@yash.com"))
    if result.scalar_one_or_none():
        return

    admin_user = User(
        name="Admin",
        email="admin@yash.com",
        phone="1234567890",
        password_hash=hash_password("admin123"),
        role="admin",
        is_active=True,
    )
    db.add(admin_user)
    await db.commit()


async def seed_products_if_empty(db: AsyncSession) -> None:
    # First, seed admin user
    await seed_admin_if_not_exists(db)
    
    result = await db.execute(select(Product.id).limit(1))
    if result.first():
        return

    for seed_item in SAMPLE_PRODUCTS:
        item = dict(seed_item)
        variants = item.pop("variants", [])
        product = Product(**item)
        for variant in variants:
            product.variants.append(Variant(**variant))
        db.add(product)

    await db.commit()
