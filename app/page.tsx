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
    icon: Calendar,
    title: "Booking H-1",
    desc: "Reservasi minimal 1 hari sebelumnya",
  },
  {
    icon: Wallet,
    title: "DP 50%",
    desc: "Bayar DP minimal 50% untuk konfirmasi",
  },
  {
    icon: Timer,
    title: "Tepat Waktu",
    desc: "Toleransi keterlambatan maksimal 30 menit",
  },
  {
    icon: XCircle,
    title: "Pembatalan",
    desc: "Pembatalan H-1 tidak ada refund",
  },
  {
    icon: Smartphone,
    title: "Konfirmasi WA",
    desc: "Booking dikonfirmasi via WhatsApp",
  },
  {
    icon: UtensilsCrossed,
    title: "Min. Order",
    desc: "Minimal order 1 menu per orang",
  },
];

export default function HomePage() {
  const restaurantName =
    process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Teras Rumah Nenek";
  const [menus, setMenus] = useState<Menu[]>([]);
  const [seatingSpots, setSeatingSpots] = useState<SeatingSpot[]>([]);

  useEffect(() => {
    fetchMenus();
    fetchSeating();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
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
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Berbagai pilihan menu lezat untuk berbuka puasa
            </p>
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
      <footer className="py-8 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <Home className="w-8 h-8 mx-auto mb-2 text-teal-400" />
          <h3 className="font-bold text-lg mb-2">{restaurantName}</h3>
          <p className="text-slate-400 text-sm mb-4">
            Jl. Contoh No. 123, Kota
          </p>
          <p className="text-slate-500 text-xs">
            © 2025 {restaurantName}. All rights reserved.
          </p>
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
