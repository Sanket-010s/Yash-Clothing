# Admin Panel - Yash Clothing

A responsive React.js (Vite) admin panel for managing a custom t-shirt brand platform. Works seamlessly on laptop, tablet, and mobile devices.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Backend API running at `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URL and Cloudinary credentials
```

### Development

```bash
# Start development server
npm run dev

# Open browser
http://localhost:5173
```

### Production Build

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 📋 Features

### Pages
- **Login** - Secure JWT-based authentication
- **Dashboard** - Real-time stats, low stock alerts, quick actions
- **Products** - Manage products (CRUD), upload images, manage variants
- **Orders** - View all orders, filter by status, update order status
- **Invoices** - View and download customer invoices
- **Coupons** - Create and manage discount coupons

### Layout
- **Desktop** - Fixed sidebar navigation with full-width content
- **Mobile** - Bottom navigation bar, optimized for small screens
- **Responsive** - Automatically adapts between tablet and desktop

### Responsive Breakpoints
- Mobile (default): < 768px
- Tablet (md): 768px+
- Desktop (lg): 1024px+
- Wide (xl): 1280px+

## 🎨 Design System

### Colors
- **Primary Gold**: #F5A623 (buttons, active states, accents)
- **Primary Text**: #1A1A1A (dark charcoal)
- **Secondary Text**: #666666 (medium gray)
- **Backgrounds**: #F5F5F5 (light gray page), #FFFFFF (cards)
- **Borders**: #E0E0E0 (light borders)
- **Sidebar**: #1A1A1A background with white text

### Typography
- **Font Family**: Montserrat (400, 500, 600, 700 weights)
- **Headings**: Bold, charcoal color
- **Body**: Regular weight, readable size

## 🔧 Configuration

### Environment Variables (.env)
```
VITE_API_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📦 Dependencies

### Core Framework
- React 18 - UI library
- React Router v6 - Routing
- Vite - Build tool

### State Management & Forms
- Zustand - State management
- React Hook Form - Form handling
- Zod - Schema validation

### UI & Components
- Tailwind CSS - Styling
- Lucide React - Icons
- React Hot Toast - Notifications

### API & Data
- Axios - HTTP client
- TanStack Table - Data tables
- React Select - Select component

## 🔐 Authentication

JWT token is automatically managed:
- Stored in `localStorage` as `admin_token`
- Attached to all API requests via Axios interceptor
- Auto-logout on 401 response
- Protected routes redirect to login if no token

### Demo Credentials
```
Email: admin@yash.com
Password: admin123
```

## 🛣️ Project Structure

```
admin/
├── src/
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── AddEditProduct.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── Invoices.jsx
│   │   └── Coupons.jsx
│   ├── components/         # Reusable components
│   │   ├── Sidebar.jsx
│   │   ├── BottomNav.jsx
│   │   ├── TopBar.jsx
│   │   ├── StatsCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── ImageUploader.jsx
│   │   ├── VariantManager.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── EmptyState.jsx
│   ├── services/           # API services
│   │   └── api.js         # Axios configuration
│   ├── store/             # State management
│   │   └── authStore.js
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.js
│   ├── lib/               # Utilities
│   │   └── utils.js
│   ├── theme/             # Design tokens
│   │   └── colors.js
│   ├── App.jsx            # Root component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 📱 Responsive Design Tips

### Mobile First Approach
- All components default to mobile-first styles
- Desktop styles override on `lg:` breakpoint for sidebar
- Bottom navigation hides on `lg:` screens
- Sidebar hidden on mobile

### Common Breakpoints
```jsx
// Hide on mobile, show on desktop
className="hidden lg:flex"

// Stack on mobile, grid on desktop
className="grid-cols-1 lg:grid-cols-4"

// Full width on mobile, container on desktop
className="w-full lg:max-w-4xl"
```

## 🔌 API Routes Reference

All requests require `Authorization: Bearer {token}` header.

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

### Products
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `POST /api/admin/products/{id}/variants` - Add variant

### Orders
- `GET /api/admin/orders` - List orders
- `GET /api/admin/orders/{id}` - Get order detail
- `PUT /api/admin/orders/{id}/status` - Update order status

### Invoices
- `GET /api/admin/invoices` - List invoices

### Coupons
- `GET /api/admin/coupons` - List coupons
- `POST /api/admin/coupons` - Create coupon
- `PUT /api/admin/coupons/{id}` - Update coupon
- `DELETE /api/admin/coupons/{id}` - Delete coupon

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Link custom domain
# In Vercel dashboard: admin.yoursite.com
```

### Environment Variables for Production
Set these in Vercel project settings:
```
VITE_API_URL=https://api.yoursite.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📊 Performance

- **Bundle Size**: < 200KB (gzipped)
- **First Load**: < 2 seconds
- **Interactive**: < 3 seconds
- **Lighthouse Score**: 85+

### Optimization Tips
- Images lazy-loaded
- Code splitting by route
- Minified production build
- Cloudinary CDN for images

## 🐛 Troubleshooting

### Login Issues
- Check API URL in .env
- Verify backend is running
- Clear localStorage and try again

### CORS Errors
- Ensure backend allows admin domain
- Check CORS headers in backend

### Image Upload Failed
- Verify Cloudinary credentials
- Check file size < 10MB
- Supported formats: PNG, JPG, GIF

### 404 on Routes
- Ensure all pages are imported in App.jsx
- Check route paths match file names

## 📝 License

© 2024 Yash Clothing. All rights reserved.

## 🤝 Support

For issues or questions, contact the development team.
