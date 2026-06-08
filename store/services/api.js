import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const token = useAuthStore.getState().token;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/api/products?${query}` : "/api/products";
    return request(path);
  },
  getProduct: (id) => request(`/api/products/${id}`),
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/api/auth/me"),
  createOrder: (payload) => request("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  getOrders: () => request("/api/orders"),
  createPaymentOrder: (payload) => request("/api/payment/create", { method: "POST", body: JSON.stringify(payload) }),
  verifyPayment: (payload) => request("/api/payment/verify", { method: "POST", body: JSON.stringify(payload) }),
  getInvoice: (orderId) => request(`/api/invoices/${orderId}`),

  getWishlist: () => request("/api/wishlist"),
  addToWishlist: (productId) => request(`/api/wishlist/${productId}`, { method: "POST" }),
  removeFromWishlist: (productId) => request(`/api/wishlist/${productId}`, { method: "DELETE" }),

  getAddresses: () => request("/api/addresses"),
  createAddress: (payload) => request("/api/addresses", { method: "POST", body: JSON.stringify(payload) }),
  deleteAddress: (id) => request(`/api/addresses/${id}`, { method: "DELETE" }),
  setDefaultAddress: (id) => request(`/api/addresses/${id}/default`, { method: "PUT" })
};
