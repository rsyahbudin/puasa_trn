import Link from "next/link";

export default function Home() {
  const restaurantName =
    process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Restoran Buka Puasa";

  return (
    <div className="hero">
      <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">
        {/* Decorative moon */}
        <div className="text-7xl mb-6 animate-float">🌙</div>
        <h1 className="text-3xl font-bold underline bg-red-900">Hello world!</h1>
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {restaurantName}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted mb-2">
          Spesial Ramadan 1446 H
        </p>

        <p className="text-lg text-muted mb-8 max-w-xl mx-auto">
          Nikmati berbuka puasa bersama keluarga dan sahabat dengan menu spesial
          kami. Suasana nyaman, makanan lezat, dan pelayanan terbaik.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="card p-6">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-semibold mb-1">Menu Spesial</h3>
            <p className="text-sm text-muted">
              Beragam pilihan menu buka puasa
            </p>
          </div>
          <div className="card p-6">
            <div className="text-3xl mb-3">🪑</div>
            <h3 className="font-semibold mb-1">Tempat Nyaman</h3>
            <p className="text-sm text-muted">Indoor, outdoor, dan VIP room</p>
          </div>
          <div className="card p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold mb-1">Booking Mudah</h3>
            <p className="text-sm text-muted">Pesan online, bayar DP 50%</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/booking"
          className="btn btn-primary text-lg px-8 py-4 animate-pulse-glow"
        >
          🌟 Booking Sekarang
        </Link>

        {/* Note */}
        <p className="mt-6 text-sm text-muted">
          Minimum DP 50% • Konfirmasi via WhatsApp
        </p>
      </div>
    </div>
  );
}
