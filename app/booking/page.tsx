"use client";

import { useState, useEffect } from "react";
import {
  formatCurrency,
  calculateDP,
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
  price: number;
  quantity: number;
  selectedOptions: { [variantName: string]: string };
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
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [variantSelections, setVariantSelections] = useState<{
    [key: string]: string;
  }>({});

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

  const addItemToOrder = (menu: Menu, options: { [key: string]: string }) => {
    const existingIndex = orderItems.findIndex(
      (item) =>
        item.menuId === menu.id &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
    );

    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal =
        updated[existingIndex].price * updated[existingIndex].quantity;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuId: menu.id,
          menuName: menu.name,
          price: menu.price,
          quantity: 1,
          selectedOptions: options,
          subtotal: menu.price,
        },
      ]);
    }
    setShowVariantModal(false);
    setSelectedMenu(null);
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

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].subtotal = updated[index].price * updated[index].quantity;
    }
    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
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

  const handleSubmit = async () => {
    // Create booking in database
    try {
      const bookingData = {
        ...customerData,
        orderItems: orderItems.map((item) => ({
          menuId: item.menuId,
          menuName: item.menuName,
          quantity: item.quantity,
          selectedOptions: Object.entries(item.selectedOptions)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", "),
          subtotal: item.subtotal,
        })),
        totalAmount,
        dpAmount,
        paymentProof,
      };

      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      // Generate WhatsApp message
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
            .map(([k, v]) => `${k}: ${v}`)
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
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Terjadi kesalahan, silakan coba lagi");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🌙</div>
          <p className="text-muted">Memuat menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🌙 Booking Buka Puasa</h1>
          <p className="text-muted">Isi data dan pilih menu untuk reservasi</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className="step">
            <div
              className={`step-number ${
                step === 1 ? "active" : step > 1 ? "completed" : "inactive"
              }`}
            >
              {step > 1 ? "✓" : "1"}
            </div>
            <span className="hidden md:inline text-sm">Data Diri</span>
          </div>
          <div className={`step-line ${step > 1 ? "active" : ""}`}></div>
          <div className="step">
            <div
              className={`step-number ${
                step === 2 ? "active" : step > 2 ? "completed" : "inactive"
              }`}
            >
              {step > 2 ? "✓" : "2"}
            </div>
            <span className="hidden md:inline text-sm">Pilih Menu</span>
          </div>
          <div className={`step-line ${step > 2 ? "active" : ""}`}></div>
          <div className="step">
            <div
              className={`step-number ${step === 3 ? "active" : "inactive"}`}
            >
              3
            </div>
            <span className="hidden md:inline text-sm">Pembayaran</span>
          </div>
        </div>

        {/* Step 1: Customer Data */}
        {step === 1 && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <h2 className="text-xl font-semibold">📝 Data Pemesan</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    className="input-field"
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
                <div className="input-group">
                  <label className="input-label">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="08xxxxxxxxxx"
                    value={customerData.phone}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Instagram</label>
                  <input
                    type="text"
                    className="input-field"
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
                <div className="input-group">
                  <label className="input-label">Tanggal Booking *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={customerData.bookingDate}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        bookingDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Jumlah Orang (Pax) *</label>
                  <input
                    type="number"
                    className="input-field"
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
                <div className="input-group">
                  <label className="input-label">Pilihan Spot Duduk *</label>
                  <select
                    className="select-field"
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
                  className="btn btn-primary"
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
          <div className="animate-fade-in">
            {/* Category Tabs */}
            <div className="category-tabs">
              <button
                className={`category-tab ${
                  selectedCategory === null ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-tab ${
                    selectedCategory === cat.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="menu-card"
                  onClick={() => handleAddToOrder(menu)}
                >
                  <div
                    className="menu-card-image"
                    style={{
                      backgroundImage: menu.image
                        ? `url(${menu.image})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!menu.image && (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="menu-card-body">
                    <h3 className="font-semibold mb-1">{menu.name}</h3>
                    <p className="text-sm text-muted mb-2 line-clamp-2">
                      {menu.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold">
                        {formatCurrency(menu.price)}
                      </span>
                      <span className="badge badge-primary">+ Tambah</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <div className="card mb-6">
                <div className="card-header">
                  <h3 className="font-semibold">🛒 Pesanan Anda</h3>
                </div>
                <div className="card-body p-0">
                  {orderItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="flex-1">
                        <p className="font-medium">{item.menuName}</p>
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-sm text-muted">
                            {Object.entries(item.selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-sm text-primary">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-outline py-1 px-3"
                          onClick={() => updateQuantity(index, -1)}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          className="btn btn-outline py-1 px-3"
                          onClick={() => updateQuantity(index, 1)}
                        >
                          +
                        </button>
                        <button
                          className="btn btn-danger py-1 px-3"
                          onClick={() => removeItem(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button className="btn btn-outline" onClick={() => setStep(1)}>
                ← Kembali
              </button>
              <button
                className="btn btn-primary"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
              >
                Lanjut ke Pembayaran →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Order Summary */}
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="font-semibold">📋 Ringkasan Pesanan</h3>
              </div>
              <div className="card-body">
                <div className="space-y-2 mb-4">
                  <p>
                    <strong>Nama:</strong> {customerData.customerName}
                  </p>
                  <p>
                    <strong>WhatsApp:</strong> {customerData.phone}
                  </p>
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {formatDate(customerData.bookingDate)}
                  </p>
                  <p>
                    <strong>Jumlah Orang:</strong> {customerData.pax} pax
                  </p>
                  <p>
                    <strong>Spot:</strong> {customerData.seating}
                  </p>
                </div>
                <hr className="my-4" />
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.menuName} x{item.quantity}
                        {Object.keys(item.selectedOptions).length > 0 && (
                          <span className="text-sm text-muted">
                            {" "}
                            ({Object.values(item.selectedOptions).join(", ")})
                          </span>
                        )}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span>Total:</span>
                    <span className="font-bold">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl text-primary font-bold">
                    <span>Minimum DP (50%):</span>
                    <span>{formatCurrency(dpAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="qr-section mb-6">
              <h3 className="text-lg font-semibold mb-2">
                📱 Scan QR untuk Pembayaran
              </h3>
              <p className="text-muted mb-4">
                Transfer minimal DP {formatCurrency(dpAmount)}
              </p>
              <div className="qr-image">
                <img
                  src="/qr-payment.png"
                  alt="QR Payment"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML =
                      '<div class="text-center text-muted p-4">QR Code<br/>(tambahkan file qr-payment.png)</div>';
                  }}
                />
              </div>
            </div>

            {/* Upload Payment Proof */}
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="font-semibold">📤 Upload Bukti Pembayaran</h3>
              </div>
              <div className="card-body">
                <label
                  className={`upload-area ${paymentProof ? "has-file" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="text-muted">Mengupload...</div>
                  ) : paymentProof ? (
                    <div>
                      <div className="text-accent text-3xl mb-2">✓</div>
                      <p className="text-accent font-medium">
                        Bukti pembayaran berhasil diupload
                      </p>
                      <img
                        src={paymentProof}
                        alt="Payment Proof"
                        className="max-w-xs mx-auto mt-4 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-muted">
                        Klik atau drag file untuk upload bukti pembayaran
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button className="btn btn-outline" onClick={() => setStep(2)}>
                ← Kembali
              </button>
              <button
                className="btn btn-secondary text-lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Kirim ke WhatsApp 📱
              </button>
            </div>
          </div>
        )}

        {/* Variant Selection Modal */}
        {showVariantModal && selectedMenu && (
          <div
            className="modal-overlay"
            onClick={() => setShowVariantModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="card-header">
                <h3 className="font-semibold">{selectedMenu.name}</h3>
                <p className="text-sm text-muted">Pilih opsi yang tersedia</p>
              </div>
              <div className="card-body">
                {selectedMenu.variants.map((variant) => (
                  <div key={variant.id} className="mb-4">
                    <label className="input-label">{variant.name}</label>
                    <div className="space-y-2">
                      {variant.options.map((option) => (
                        <label
                          key={option.id}
                          className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            variantSelections[variant.name] === option.name
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={variant.name}
                            value={option.name}
                            checked={
                              variantSelections[variant.name] === option.name
                            }
                            onChange={() =>
                              setVariantSelections({
                                ...variantSelections,
                                [variant.name]: option.name,
                              })
                            }
                            className="hidden"
                          />
                          <span>{option.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-6">
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => setShowVariantModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="btn btn-primary flex-1"
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
