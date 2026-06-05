"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import StickyBar from "@/components/StickyBar";
import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isSaved = useWishlistStore((state) => state.isSaved(id));

  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [pincode, setPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState("");
  const [imageZoom, setImageZoom] = useState({ x: 0, y: 0 });

  useEffect(() => {
    api
      .getProduct(id)
      .then((productData) => {
        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          const uniqueSizes = [...new Set(productData.variants.map((v) => v.size))];
          setSizes(uniqueSizes);
          setSelectedSize(uniqueSizes[0]);
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handleWishlist = () => {
    const saved = toggleItem(product);
    showToast(saved ? "Added to wishlist" : "Removed from wishlist", "success");
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    setPincode(value);

    if (value.length === 6) {
      // Calculate estimated delivery (3-5 days from now)
      const days = Math.floor(Math.random() * 3) + 3;
      const date = new Date();
      date.setDate(date.getDate() + days);
      setDeliveryDate(date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }));
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageZoom({ x, y });
  };

  const addToCart = () => {
    if (!product || !selectedSize) {
      showToast("Please select a size", "error");
      return;
    }
    addItem(product, { size: selectedSize });
    showToast("Added to cart", "success");
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  if (error) {
    return <div className="p-4 text-sm text-rose-600">{error}</div>;
  }

  if (!product) {
    return <div className="p-4 text-sm text-slate-500">Loading product...</div>;
  }

  const mrp = product.base_price || 0;
  const price = product.sale_price || product.base_price || 0;
  const discount = mrp > 0 && price < mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const highlights = ["Premium Cotton", "Breathable Fabric", "Machine Washable", "Eco-Friendly Printing", "Oversized Fit"];

  return (
    <div className="bg-white min-h-screen">
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Section - Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative h-[400px] lg:h-[600px] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setImageZoom({ x: 0, y: 0 })}
            >
              <Image
                src={product.images?.[currentImageIndex] || "https://placehold.co/600x800"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-125 transition-transform duration-500"
                style={{
                  transformOrigin: `${imageZoom.x}% ${imageZoom.y}%`,
                }}
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      currentImageIndex === index ? "border-yellow-400 shadow-md" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Product Information */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Yash Collection</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">(248 reviews)</span>
            </div>

            {/* Price Section */}
            <div className="space-y-2 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">₹{Math.round(price)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{Math.round(mrp)}</span>
                    <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-semibold">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            {/* Material Badges */}
            <div className="flex flex-wrap gap-2">
              {["100% Cotton", "Bio Wash", "Oversized Fit"].map((badge) => (
                <span
                  key={badge}
                  className="inline-block bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Size Selection */}
            <div className="space-y-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">SELECT SIZE</h3>
                <button className="text-xs font-semibold text-yellow-600 hover:text-yellow-700 underline">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-2 rounded-lg font-semibold transition text-sm ${
                      selectedSize === size
                        ? "bg-gray-900 text-white border-2 border-gray-900"
                        : "bg-gray-100 text-gray-900 border-2 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-xs text-gray-600">
                  📏 Length: 74cm | Chest: 54cm | Sleeve: 8cm (for size {selectedSize})
                </p>
              )}
            </div>

            {/* Product Highlights */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-bold text-gray-900">Why Choose This?</h3>
              <ul className="space-y-2">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery Section */}
            <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-bold text-gray-900">Delivery Details</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={handlePincodeChange}
                  maxLength="6"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {deliveryDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Estimated delivery by {deliveryDate}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">FREE</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={addToCart}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg transition shadow-md text-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={buyNow}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                <HeartIcon filled={isSaved} />
                {isSaved ? "Saved" : "Save to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Product Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Size Chart</h2>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { size: "S", chest: "52cm", length: "72cm" },
                    { size: "M", chest: "54cm", length: "74cm" },
                    { size: "L", chest: "56cm", length: "76cm" },
                    { size: "XL", chest: "58cm", length: "78cm" },
                  ].map((row) => (
                    <tr key={row.size} className="border-b border-gray-200">
                      <td className="py-2 font-medium text-gray-900">{row.size}</td>
                      <td className="py-2 text-gray-700">{row.chest}</td>
                      <td className="py-2 text-gray-700">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Care Instructions</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Machine wash in cold water</li>
                <li>• Wash with similar colors</li>
                <li>• Use mild detergent</li>
                <li>• Dry in shade</li>
                <li>• Iron on medium heat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeartIcon({ filled }) {
  if (filled) {
    return (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21s-7-4.9-9.5-8A5.7 5.7 0 0 1 7 3.5a6.5 6.5 0 0 1 5 2.4 6.5 6.5 0 0 1 5-2.4 5.7 5.7 0 0 1 4.5 9.5C19 16.1 12 21 12 21z" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s-7-4.9-9.5-8A5.7 5.7 0 0 1 7 3.5a6.5 6.5 0 0 1 5 2.4 6.5 6.5 0 0 1 5-2.4 5.7 5.7 0 0 1 4.5 9.5C19 16.1 12 21 12 21z" />
    </svg>
  );
}
