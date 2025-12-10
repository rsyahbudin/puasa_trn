"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  formatCurrency,
  calculateDP,
  calculateTax,
  TAX_RATE,
  formatWhatsAppMessage,
  generateWhatsAppLink,
  formatDate,
} from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface VariantOption {
  id: number;
  name: string;
  price: number;
}

interface MenuVariant {
  id: number;
  name: string;
  options: VariantOption[];
}

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  categoryId: number;
  category: Category;
  variants: MenuVariant[];
}

interface OrderItem {
  menuId: number;
  menuName: string;
  basePrice: number;
  variantPrice: number;
  quantity: number;
  selectedOptions: { [variantName: string]: { name: string; price: number } };
  subtotal: number;
}

interface CustomerData {
  customerName: string;
  phone: string;
  instagram: string;
  bookingDate: string;
  pax: number;
  seating: string;
}

const SEATING_OPTIONS = ["Indoor", "Outdoor", "VIP Room"];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData>({
    customerName: "",
    phone: "",
    instagram: "",
    bookingDate: "",
    pax: 2,
    seating: "Indoor",
  });
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [variantSelections, setVariantSelections] = useState<{
    [key: string]: { name: string; price: number };
  }>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 2500);
  };

  const restaurantPhone =
    process.env.NEXT_PUBLIC_RESTAURANT_PHONE || "6281234567890";

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenus(data.menus || []);
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setSelectedCategory(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menus:", error);
      setLoading(false);
    }
  };

  const handleAddToOrder = (menu: Menu) => {
    if (menu.variants && menu.variants.length > 0) {
      setSelectedMenu(menu);
      setVariantSelections({});
      setShowVariantModal(true);
    } else {
      addItemToOrder(menu, {});
    }
  };

  const addItemToOrder = (
    menu: Menu,
    options: { [key: string]: { name: string; price: number } }
  ) => {
    const variantPrice = Object.values(options).reduce(
      (sum, opt) => sum + opt.price,
      0
    );
    const itemPrice = menu.price + variantPrice;

    const optionKey = JSON.stringify(options);
    const existingIndex = orderItems.findIndex(
      (item) =>
        item.menuId === menu.id &&
        JSON.stringify(item.selectedOptions) === optionKey
    );

    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal =
        itemPrice * updated[existingIndex].quantity;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuId: menu.id,
          menuName: menu.name,
          basePrice: menu.price,
          variantPrice,
          quantity: 1,
          selectedOptions: options,
          subtotal: itemPrice,
        },
      ]);
    }
    setShowVariantModal(false);
    setSelectedMenu(null);
    showToast(`✅ ${menu.name} ditambahkan ke keranjang!`);
  };

  const handleVariantConfirm = () => {
    if (selectedMenu) {
      const allSelected = selectedMenu.variants.every(
        (v) => variantSelections[v.name]
      );
      if (allSelected) {
        addItemToOrder(selectedMenu, variantSelections);
      } else {
        alert("Mohon pilih semua opsi yang tersedia");
      }
    }
  };

  const calculateItemPrice = (item: OrderItem) => {
    return (item.basePrice + item.variantPrice) * item.quantity;
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].subtotal = calculateItemPrice(updated[index]);
    }
    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const subtotalAmount = orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  const taxAmount = calculateTax(subtotalAmount);
  const totalAmount = subtotalAmount + taxAmount;
  const dpAmount = calculateDP(totalAmount);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPaymentProof(data.url);
      } else {
        alert("Upload gagal, silakan coba lagi");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload gagal, silakan coba lagi");
    }
    setUploading(false);
  };

  // Submit booking to database
  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      const bookingData = {
        ...customerData,
        orderItems: orderItems.map((item) => ({
          menuId: item.menuId,
          menuName: item.menuName,
          quantity: item.quantity,
          selectedOptions: Object.entries(item.selectedOptions)
            .map(
              ([k, v]) =>
                `${k}: ${v.name}${
                  v.price !== 0 ? ` (+${formatCurrency(v.price)})` : ""
                }`
            )
            .join(", "),
          subtotal: item.subtotal,
        })),
        totalAmount,
        dpAmount,
        paymentProof,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await res.json();
      if (res.ok) {
        setBookingId(result.id);
        setStep(4); // Go to confirmation page
      } else {
        alert("Gagal membuat booking: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Terjadi kesalahan, silakan coba lagi");
    }
    setSubmitting(false);
  };

  // Open WhatsApp
  const handleOpenWhatsApp = () => {
    const message = formatWhatsAppMessage({
      customerName: customerData.customerName,
      phone: customerData.phone,
      instagram: customerData.instagram,
      bookingDate: formatDate(customerData.bookingDate),
      pax: customerData.pax,
      seating: customerData.seating,
      orderItems: orderItems.map((item) => ({
        menuName: item.menuName,
        quantity: item.quantity,
        selectedOptions: Object.entries(item.selectedOptions)
          .map(
            ([k, v]) =>
              `${k}: ${v.name}${
                v.price !== 0 ? ` (+${formatCurrency(v.price)})` : ""
              }`
          )
          .join(", "),
        subtotal: item.subtotal,
      })),
      totalAmount,
      dpAmount,
      paymentProofUrl: paymentProof
        ? `${window.location.origin}${paymentProof}`
        : undefined,
    });

    const waLink = generateWhatsAppLink(restaurantPhone, message);
    window.open(waLink, "_blank");
  };

  const canProceedStep1 =
    customerData.customerName &&
    customerData.phone &&
    customerData.bookingDate &&
    customerData.pax > 0;
  const canProceedStep2 = orderItems.length > 0;
  const canSubmit = paymentProof;

  const filteredMenus = selectedCategory
    ? menus.filter((m) => m.categoryId === selectedCategory)
    : menus;

  const getVariantTotalPrice = () => {
    if (!selectedMenu) return 0;
    return Object.values(variantSelections).reduce(
      (sum, opt) => sum + opt.price,
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌙</div>
          <p className="text-slate-500">Memuat menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-4 md:py-8 px-3 md:px-4 pb-20 md:pb-8">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm">
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-medium mb-3 hover:underline"
          >
            ← Kembali ke Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Booking Buka Puasa
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Isi data dan pilih menu untuk reservasi
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-2 md:gap-4 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <span className="hidden md:inline text-sm text-slate-600 dark:text-slate-400">
                {s === 1
                  ? "Data Diri"
                  : s === 2
                  ? "Pilih Menu"
                  : s === 3
                  ? "Pembayaran"
                  : "Konfirmasi"}
              </span>
              {s < 4 && (
                <div
                  className={`hidden md:block w-8 h-0.5 ${
                    step > s ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Customer Data */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-amber-50 dark:from-slate-800 dark:to-slate-800">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                📝 Data Pemesan
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                    value={customerData.customerName}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        customerName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="628xxxxxxxxxx"
                    value={customerData.phone}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="@username"
                    value={customerData.instagram}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        instagram: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Tanggal Booking *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    value={customerData.bookingDate}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        bookingDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Jumlah Orang (Pax) *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    min="1"
                    value={customerData.pax}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        pax: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Pilihan Spot Duduk *
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
                    value={customerData.seating}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        seating: e.target.value,
                      })
                    }
                  >
                    {SEATING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  Lanjut Pilih Menu →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Menu Selection */}
        {step === 2 && (
          <div>
            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap mb-6 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === null
                    ? "bg-teal-500 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6">
              {filteredMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer group active:scale-95"
                  onClick={() => handleAddToOrder(menu)}
                >
                  <div className="h-24 md:h-40 bg-gradient-to-br from-teal-100 to-amber-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                    {menu.image ? (
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl md:text-5xl">🍽️</span>
                    )}
                  </div>
                  <div className="p-2 md:p-4">
                    <h3 className="font-semibold text-xs md:text-base text-slate-800 dark:text-white mb-1 line-clamp-1">
                      {menu.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1 md:line-clamp-2 hidden md:block">
                      {menu.description}
                    </p>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
                      <div>
                        <span className="text-teal-600 dark:text-teal-400 font-bold text-xs md:text-base">
                          {formatCurrency(menu.price)}
                        </span>
                        {menu.variants?.length > 0 && (
                          <span className="text-xs text-slate-400 ml-1 hidden md:inline">
                            +varian
                          </span>
                        )}
                      </div>
                      <span className="px-2 md:px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-semibold rounded-full group-hover:bg-teal-500 group-hover:text-white transition-all">
                        + Tambah
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    🛒 Pesanan Anda
                  </h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 dark:text-white">
                          {item.menuName}
                        </p>
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-sm text-slate-500">
                            {Object.entries(item.selectedOptions).map(
                              ([k, v]) => (
                                <span key={k}>
                                  {k}: {v.name}
                                  {v.price !== 0 && (
                                    <span className="text-amber-600">
                                      {" "}
                                      (+{formatCurrency(v.price)})
                                    </span>
                                  )}{" "}
                                </span>
                              )
                            )}
                          </p>
                        )}
                        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                          {formatCurrency(item.basePrice + item.variantPrice)} ×{" "}
                          {item.quantity} = {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 hover:border-teal-500 transition-all"
                          onClick={() => updateQuantity(index, -1)}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 hover:border-teal-500 transition-all"
                          onClick={() => updateQuantity(index, 1)}
                        >
                          +
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          onClick={() => removeItem(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gradient-to-r from-teal-50 to-amber-50 dark:from-slate-700 dark:to-slate-700 space-y-1">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Pajak ({TAX_RATE * 100}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-600">
                    <span>Total:</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - Desktop */}
            <div className="hidden md:flex justify-between">
              <button
                className="px-6 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:border-teal-500 hover:text-teal-500 transition-all"
                onClick={() => setStep(1)}
              >
                ← Kembali
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
              >
                Lanjut ke Pembayaran →
              </button>
            </div>

            {/* Mobile Floating Cart Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 z-40">
              <div className="flex items-center justify-between gap-2">
                <button
                  className="px-3 py-2 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-lg text-sm"
                  onClick={() => setStep(1)}
                >
                  ←
                </button>
                <div className="flex-1 text-center">
                  {orderItems.length > 0 ? (
                    <div>
                      <span className="text-xs text-slate-500">
                        {orderItems.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                        item
                      </span>
                      <span className="font-bold text-teal-600 ml-2">
                        {formatCurrency(subtotalAmount)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Pilih menu</span>
                  )}
                </div>
                <button
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  Lanjut →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            {/* Order Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  📋 Ringkasan Pesanan
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-slate-500">Nama:</span>{" "}
                    <span className="font-medium text-slate-800 dark:text-white">
                      {customerData.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">WhatsApp:</span>{" "}
                    <span className="font-medium text-slate-800 dark:text-white">
                      {customerData.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tanggal:</span>{" "}
                    <span className="font-medium text-slate-800 dark:text-white">
                      {formatDate(customerData.bookingDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Jumlah:</span>{" "}
                    <span className="font-medium text-slate-800 dark:text-white">
                      {customerData.pax} pax
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Spot:</span>{" "}
                    <span className="font-medium text-slate-800 dark:text-white">
                      {customerData.seating}
                    </span>
                  </div>
                </div>
                <hr className="my-4 border-slate-200 dark:border-slate-700" />
                <div className="space-y-2 mb-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.menuName} x{item.quantity}
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <span className="text-slate-400 text-xs">
                            {" "}
                            (
                            {Object.values(item.selectedOptions)
                              .map((v) => v.name)
                              .join(", ")}
                            )
                          </span>
                        )}
                      </span>
                      <span className="text-slate-800 dark:text-white font-medium">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="my-4 border-slate-200 dark:border-slate-700" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Pajak ({TAX_RATE * 100}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-white">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-teal-600 pt-2 border-t border-slate-200 dark:border-slate-600">
                    <span>Minimum DP (50%):</span>
                    <span>{formatCurrency(dpAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gradient-to-br from-teal-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                📱 Scan QR untuk Pembayaran
              </h3>
              <p className="text-slate-500 mb-4">
                Transfer minimal DP {formatCurrency(dpAmount)}
              </p>
              <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center shadow-lg">
                <img
                  src="/qr-payment.png"
                  alt="QR Payment"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML =
                      '<div class="text-center text-slate-400 p-4">QR Code<br/>(tambahkan file qr-payment.png)</div>';
                  }}
                />
              </div>
            </div>

            {/* Upload Payment Proof */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  📤 Upload Bukti Pembayaran
                </h3>
              </div>
              <div className="p-6">
                <label
                  className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    paymentProof
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                      : "border-slate-300 dark:border-slate-600 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="text-slate-500">Mengupload...</div>
                  ) : paymentProof ? (
                    <div>
                      <div className="text-green-500 text-4xl mb-2">✓</div>
                      <p className="text-green-600 font-medium">
                        Bukti pembayaran berhasil diupload
                      </p>
                      <img
                        src={paymentProof}
                        alt="Payment Proof"
                        className="max-w-xs mx-auto mt-4 rounded-lg shadow"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-slate-500">
                        Klik atau drag file untuk upload bukti pembayaran
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                className="px-6 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:border-teal-500 hover:text-teal-500 transition-all"
                onClick={() => setStep(2)}
              >
                ← Kembali
              </button>
              <button
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSubmit || submitting}
                onClick={handleSubmitBooking}
              >
                {submitting ? "Menyimpan..." : "Konfirmasi Booking →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-8 text-center border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Booking Berhasil!
              </h2>
              <p className="text-slate-500">
                Booking Anda telah tersimpan dengan ID #{bookingId}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                  📋 Detail Booking
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500">Nama:</div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    {customerData.customerName}
                  </div>
                  <div className="text-slate-500">Tanggal:</div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    {formatDate(customerData.bookingDate)}
                  </div>
                  <div className="text-slate-500">Jumlah:</div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    {customerData.pax} pax
                  </div>
                  <div className="text-slate-500">Spot:</div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    {customerData.seating}
                  </div>
                  <div className="text-slate-500">Total:</div>
                  <div className="font-bold text-teal-600">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="text-slate-500">DP Dibayar:</div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(dpAmount)}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>⚠️ Penting:</strong> Silakan konfirmasi booking Anda
                  melalui WhatsApp agar pesanan dapat diproses.
                </p>
              </div>

              <button
                className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                onClick={handleOpenWhatsApp}
              >
                <span className="text-2xl">📱</span>
                Konfirmasi via WhatsApp
              </button>

              <p className="text-center text-slate-500 text-sm mt-4">
                Terima kasih telah booking di restoran kami! 🙏
              </p>
            </div>
          </div>
        )}

        {/* Variant Selection Modal */}
        {showVariantModal && selectedMenu && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowVariantModal(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                  {selectedMenu.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Harga dasar: {formatCurrency(selectedMenu.price)}
                </p>
              </div>
              <div className="p-6">
                {selectedMenu.variants.map((variant) => (
                  <div key={variant.id} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {variant.name}
                    </label>
                    <div className="space-y-2">
                      {variant.options.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${
                            variantSelections[variant.name]?.name ===
                            option.name
                              ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30"
                              : "border-slate-200 dark:border-slate-600 hover:border-teal-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={variant.name}
                              value={option.name}
                              checked={
                                variantSelections[variant.name]?.name ===
                                option.name
                              }
                              onChange={() =>
                                setVariantSelections({
                                  ...variantSelections,
                                  [variant.name]: {
                                    name: option.name,
                                    price: option.price,
                                  },
                                })
                              }
                              className="hidden"
                            />
                            <span className="text-slate-700 dark:text-slate-300">
                              {option.name}
                            </span>
                          </div>
                          {option.price !== 0 && (
                            <span
                              className={`text-sm font-medium ${
                                option.price > 0
                                  ? "text-amber-600"
                                  : "text-green-600"
                              }`}
                            >
                              {option.price > 0 ? "+" : ""}
                              {formatCurrency(option.price)}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Price Preview */}
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Harga Dasar:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatCurrency(selectedMenu.price)}
                    </span>
                  </div>
                  {getVariantTotalPrice() !== 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Tambahan Varian:</span>
                      <span
                        className={
                          getVariantTotalPrice() > 0
                            ? "text-amber-600"
                            : "text-green-600"
                        }
                      >
                        {getVariantTotalPrice() > 0 ? "+" : ""}
                        {formatCurrency(getVariantTotalPrice())}
                      </span>
                    </div>
                  )}
                  <hr className="my-2 border-slate-200 dark:border-slate-600" />
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700 dark:text-slate-300">
                      Total:
                    </span>
                    <span className="text-teal-600">
                      {formatCurrency(
                        selectedMenu.price + getVariantTotalPrice()
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:border-slate-400 transition-all"
                    onClick={() => setShowVariantModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    onClick={handleVariantConfirm}
                  >
                    Tambah ke Pesanan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
