from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from config import get_settings
from database.db import AsyncSessionLocal, init_db
from routes import addresses, admin, auth, cart, coupons, designs, invoices, orders, payment, products, wishlist
from services.seed import seed_products_if_empty

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    async with AsyncSessionLocal() as db:
        await seed_products_if_empty(db)
    yield


app = FastAPI(title="Custom T-Shirt Platform API", version="1.0.0", lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # local frontend
        "http://localhost:5173",    # local admin
        "http://localhost:5174",    # local admin alternate port
        settings.FRONTEND_URL,      # production frontend
        settings.ADMIN_URL,         # production admin
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(products.admin_router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(payment.router)
app.include_router(invoices.router)
app.include_router(invoices.admin_router)
app.include_router(addresses.router)
app.include_router(wishlist.router)
app.include_router(designs.router)
app.include_router(coupons.router)


@app.get("/health")
@app.head("/health")
async def health():
    return {"status": "ok"}
