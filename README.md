# Custom T-Shirt Brand Platform

Mobile-first D2C e-commerce platform for buying and designing custom T-shirts.

Current working scope: customer store + backend API.  
Admin panel is intentionally excluded for now.

## Project Structure

```
/
|-- store/      # Customer website (Next.js 14, JavaScript)
|-- backend/    # API server (FastAPI, SQLAlchemy)
`-- Documentation/
```

## Implemented Bootstrap (Phase 1 start)

### Backend (`backend/`)

- FastAPI app with CORS and health endpoint
- SQLite/PostgreSQL-ready SQLAlchemy setup
- Auth routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Product routes:
  - `GET /api/products`
  - `GET /api/products/{id}`
- Order routes:
  - `POST /api/orders` (guest or logged-in)
  - `GET /api/orders` (logged-in user)
- Payment routes (development stub):
  - `POST /api/payment/create`
  - `POST /api/payment/verify`
- Invoice route (basic response / placeholder):
  - `GET /api/invoices/{order_id}`
- Auto-seeding sample products on first startup

### Store (`store/`)

- Next.js App Router setup
- Pages:
  - `/`
  - `/shop`
  - `/product/[id]`
  - `/customize`
  - `/cart`
  - `/checkout`
  - `/orders`
  - `/profile`
  - `/auth/login`
  - `/auth/register`
- Zustand stores:
  - auth session
  - cart
  - design draft
- Shared components:
  - `Navbar`
  - `BottomNav`
  - `ProductCard`
  - `CartItem`
  - `StickyBar`
  - `CanvasEditor` (Phase 3-ready placeholder)

## Local Setup

## 1) Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

## 2) Store

```bash
cd store
npm install
copy .env.example .env.local
npm run dev
```

Store runs at `http://localhost:3000`

## Notes

- Payment verification is currently a development stub.
- Invoice PDF generation is not implemented yet.
- Admin panel endpoints/UI are not included in this sprint.

## Next Build Targets

1. Replace payment stub with full Razorpay flow.
2. Add address, wishlist, and saved design APIs.
3. Add proper invoice generation and download flow.
4. Add tests for auth, products, and order creation.
