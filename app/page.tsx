import Link from "next/link";

export default function Home() {
  const restaurantName =
    process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Restoran Buka Puasa";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Moon icon */}
        <div className="text-7xl mb-6 animate-bounce">🌙</div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-amber-500 bg-clip-text text-transparent">
          {restaurantName}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-2">
          Spesial Ramadan 1446 H
        </p>

        <p className="text-lg text-slate-500 dark:text-slate-500 mb-8 max-w-xl mx-auto">
          Nikmati berbuka puasa bersama keluarga dan sahabat dengan menu spesial
          kami. Suasana nyaman, makanan lezat, dan pelayanan terbaik.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-semibold mb-1 text-slate-800 dark:text-white">
              Menu Spesial
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Beragam pilihan menu buka puasa
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">🪑</div>
            <h3 className="font-semibold mb-1 text-slate-800 dark:text-white">
              Tempat Nyaman
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Indoor, outdoor, dan VIP room
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold mb-1 text-slate-800 dark:text-white">
              Booking Mudah
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pesan online, bayar DP 50%
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          🌟 Booking Sekarang
        </Link>

        {/* Note */}
        <p className="mt-6 text-sm text-slate-400">
          Minimum DP 50% • Konfirmasi via WhatsApp
        </p>
      </div>
    </div>
  );
}
