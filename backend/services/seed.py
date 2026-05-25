from sqlalchemy.orm import Session

from models.product import Product

SAMPLE_PRODUCTS = [
    {
        "name": "Classic Black Tee",
        "description": "Soft cotton black tee with minimalist fit.",
        "category": "Basics",
        "price": 499,
        "mrp": 799,
        "stock": 50,
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900",
    },
    {
        "name": "Oversized Street Tee",
        "description": "Relaxed fit oversized t-shirt with drop shoulders.",
        "category": "Oversized",
        "price": 699,
        "mrp": 999,
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900",
    },
    {
        "name": "Graphic Anime Print",
        "description": "High density anime-inspired print, pre-shrunk cotton.",
        "category": "Graphic",
        "price": 799,
        "mrp": 1199,
        "stock": 35,
        "image_url": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900",
    },
    {
        "name": "Customizable White Tee",
        "description": "Design-ready plain white tee for custom prints.",
        "category": "Custom",
        "price": 599,
        "mrp": 899,
        "stock": 60,
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900",
    },
]


def seed_products_if_empty(db: Session) -> None:
    existing = db.query(Product).count()
    if existing > 0:
        return

    for item in SAMPLE_PRODUCTS:
        db.add(Product(**item))
    db.commit()
