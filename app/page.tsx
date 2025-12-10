"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  UtensilsCrossed,
  Armchair,
  Clock,
  MapPin,
  Calendar,
  Wallet,
  Timer,
  XCircle,
  Smartphone,
  Users,
  ChevronDown,
  FileText,
  Star,
} from "lucide-react";

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  category: { name: string };
}

interface SeatingSpot {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  capacity: string;
  isActive: boolean;
}

const RULES = [
  {
    icon: Users,
    title: "Paket = Pax",
    desc: "Jumlah paket harus sesuai dengan jumlah pax/orang yang datang",
  },
  {
    icon: UtensilsCrossed,
    title: "Snack Bukan Paket",
    desc: "Snack tidak termasuk dalam paket menu Ramadan",
  },
  {
    icon: Clock,
    title: "Menu Tambahan",
    desc: "Menu tambahan diluar paket bisa dipesan langsung ditempat setelah jam 19.00 WIB",
  },
  {
    icon: Wallet,
    title: "Harga Sudah Termasuk",
    desc: "Booking fee + takjil + free flow es teh sampai jam 19.00 WIB",
  },
  {
    icon: Timer,
    title: "Batas Booking",
    desc: "Maksimal booking hari H jam 15.00 WIB. Lebih dari itu, hubungi WhatsApp kami",
  },
];

export default function HomePage() {
  const restaurantName =
    process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Teras Rumah Nenek";
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [seatingSpots, setSeatingSpots] = useState<SeatingSpot[]>([]);

  useEffect(() => {
    fetchMenus();
    fetchSeating();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setAllMenus(data.menus || []);
      setCategories(data.categories || []);
      // Show first 6 menus by default
      setMenus((data.menus || []).slice(0, 6));
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchSeating = async () => {
    try {
      const res = await fetch("/api/seating");
      const data = await res.json();
      setSeatingSpots((data || []).filter((s: SeatingSpot) => s.isActive));
    } catch (error) {
      console.error("Error fetching seating:", error);
    }
  };

  // Filter menus by selected category
  useEffect(() => {
    if (selectedCategory === null) {
      setMenus(allMenus.slice(0, 6));
    } else {
      const filtered = allMenus.filter(
        (m) =>
          m.category?.name ===
          categories.find((c) => c.id === selectedCategory)?.name
      );
      setMenus(filtered.slice(0, 6));
    }
  }, [selectedCategory, allMenus, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="font-bold text-lg text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Home className="w-5 h-5" />
            {restaurantName}
          </div>
          <div className="hidden md:flex gap-6 text-sm">
            <a
              href="#hero"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#menu"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
            >
              Menu
            </a>
            <a
              href="#seating"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
            >
              Tempat
            </a>
            <a
              href="#location"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
            >
              Lokasi
            </a>
            <a
              href="#rules"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
            >
              Syarat
            </a>
          </div>
          <Link
            href="/booking"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-full transition-all"
          >
            Booking
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-20 min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      >
        <div className="absolute top-20 right-0 w-72 md:w-96 h-72 md:h-96 bg-teal-200/40 dark:bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 md:w-96 h-72 md:h-96 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto py-12">
          <div className="mb-6">
            <Home className="w-16 h-16 md:w-20 md:h-20 mx-auto text-teal-600 dark:text-teal-400" />
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-600 via-amber-500 to-orange-500 bg-clip-text text-transparent leading-tight">
            {restaurantName}
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-3">
            Spesial Ramadan 1446 H
          </p>

          <p className="text-base md:text-lg text-slate-500 dark:text-slate-500 mb-8 max-w-2xl mx-auto px-4">
            Nikmati berbuka puasa bersama keluarga dan sahabat dengan menu
            spesial kami. Suasana nyaman seperti di rumah nenek, makanan lezat,
            dan pelayanan terbaik.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 px-2">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-white">
                Menu Spesial
              </h3>
              <p className="text-xs md:text-sm text-slate-500">
                20+ pilihan menu
              </p>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <Armchair className="w-8 h-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-white">
                {seatingSpots.length || 3} Area
              </h3>
              <p className="text-xs md:text-sm text-slate-500">
                Pilihan tempat
              </p>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-white">
                Buka 16:00
              </h3>
              <p className="text-xs md:text-sm text-slate-500">Sampai 21:00</p>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-white">
                Lokasi
              </h3>
              <p className="text-xs md:text-sm text-slate-500">Lihat di peta</p>
            </div>
          </div>

          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-base md:text-lg font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <Star className="w-5 h-5" />
            Booking Sekarang
          </Link>

          <div className="mt-12 animate-bounce">
            <a href="#menu" className="text-slate-400">
              <ChevronDown className="w-8 h-8 mx-auto" />
            </a>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section
        id="menu"
        className="py-16 md:py-24 px-4 bg-white dark:bg-slate-800/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-center gap-3">
              <UtensilsCrossed className="w-8 h-8 text-teal-600" />
              Menu Spesial Kami
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-6">
              Berbagai pilihan menu lezat untuk berbuka puasa
            </p>

            {/* Category Tabs */}
            {categories.length > 0 && (
              <div className="flex justify-center gap-2 flex-wrap">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? "bg-teal-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-teal-500 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {menus.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white dark:bg-slate-700 rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="h-28 md:h-40 bg-gradient-to-br from-teal-100 to-amber-100 dark:from-slate-600 dark:to-slate-500 flex items-center justify-center overflow-hidden">
                    {menu.image ? (
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <UtensilsCrossed className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-white mb-1 line-clamp-1">
                      {menu.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                      {menu.description || "Menu spesial"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-teal-600 dark:text-teal-400 font-bold text-sm md:text-base">
                        {formatCurrency(menu.price)}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded-full text-slate-500 dark:text-slate-400">
                        {menu.category?.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Memuat menu...</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              Lihat semua menu & booking →
            </Link>
          </div>
        </div>
      </section>

      {/* Seating Section */}
      <section
        id="seating"
        className="py-16 md:py-24 px-4 bg-gradient-to-br from-amber-50 to-teal-50 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-center gap-3">
              <Armchair className="w-8 h-8 text-teal-600" />
              Pilihan Tempat Duduk
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Pilih tempat sesuai kebutuhan dan kenyamanan Anda
            </p>
          </div>

          {seatingSpots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {seatingSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="h-40 md:h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden">
                    {spot.image ? (
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Armchair className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-white mb-2">
                      {spot.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {spot.description || "Tempat nyaman untuk berbuka puasa"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
                      <Users className="w-4 h-4" />
                      <span>{spot.capacity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {["Indoor AC", "Outdoor Garden", "VIP Room"].map((name, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg"
                >
                  <div className="h-40 md:h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                    <Armchair className="w-16 h-16 text-slate-400" />
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-bold text-lg md:text-xl text-slate-800 dark:text-white mb-2">
                      {name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      Tempat nyaman untuk berbuka puasa
                    </p>
                    <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400">
                      <Users className="w-4 h-4" />
                      <span>2-20 orang</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Location Section with Google Maps */}
      <section
        id="location"
        className="py-16 md:py-24 px-4 bg-white dark:bg-slate-800/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-center gap-3">
              <MapPin className="w-8 h-8 text-teal-600" />
              Lokasi Kami
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Temukan kami di Google Maps
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.2372420073593!2d106.8811137!3d-6.3633346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed302dffac99%3A0x5865ecdaf645cf7f!2sTeras%20Rumah%20Nenek!5e0!3m2!1sen!2sid!4v1765354750098!5m2!1sen!2sid"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://maps.google.com/?q=Teras+Rumah+Nenek"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              <MapPin className="w-4 h-4" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section
        id="rules"
        className="py-16 md:py-24 px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-teal-600" />
              Syarat & Ketentuan
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Harap perhatikan ketentuan berikut sebelum melakukan booking
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {RULES.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
                >
                  <Icon className="w-8 h-8 mb-2 text-teal-600 dark:text-teal-400" />
                  <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-white mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    {rule.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Siap Booking?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Jangan sampai kehabisan tempat! Booking sekarang untuk berbuka puasa
            bersama.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-white text-teal-600 font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <Star className="w-5 h-5" />
            Booking Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand */}
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Home className="w-6 h-6 text-teal-400" />
                <h3 className="font-bold text-lg">{restaurantName}</h3>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                Spesial Ramadan 1446 H
              </p>
              <p className="text-slate-500 text-sm">
                Mari pulang, mari membuka ruang.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-base mb-3">Kontak</h4>
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  <span className="text-slate-500">WhatsApp:</span>{" "}
                  6281804040684
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Jam Buka:</span> 16:00 -
                  21:00 WIB
                </p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Alamat:</span> Jl. Contoh No.
                  123
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold text-base mb-3">Ikuti Kami</h4>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <a
                  href="https://instagram.com/terasrumahnenek"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-all"
                  title="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/6281804040684"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-green-600 flex items-center justify-center transition-all"
                  title="WhatsApp"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href="https://tiktok.com/@terasrumahnenek"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-black flex items-center justify-center transition-all border border-slate-700 hover:border-white"
                  title="TikTok"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-center">
            <p className="text-slate-500 text-xs">
              © 2025 {restaurantName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-2 px-4 z-50">
        <div className="flex justify-around items-center">
          <a
            href="#hero"
            className="flex flex-col items-center text-slate-500 hover:text-teal-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </a>
          <a
            href="#menu"
            className="flex flex-col items-center text-slate-500 hover:text-teal-500 transition-colors"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-xs">Menu</span>
          </a>
          <Link
            href="/booking"
            className="flex flex-col items-center -mt-6 bg-teal-500 text-white p-3 rounded-full shadow-lg"
          >
            <Calendar className="w-6 h-6" />
          </Link>
          <a
            href="#seating"
            className="flex flex-col items-center text-slate-500 hover:text-teal-500 transition-colors"
          >
            <Armchair className="w-5 h-5" />
            <span className="text-xs">Tempat</span>
          </a>
          <a
            href="#location"
            className="flex flex-col items-center text-slate-500 hover:text-teal-500 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs">Lokasi</span>
          </a>
        </div>
      </div>
    </div>
  );
}
