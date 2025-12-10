"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface Booking {
  id: number;
  customerName: string;
  phone: string;
  bookingDate: string;
  pax: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data);

      const pending = data.filter(
        (b: Booking) => b.status === "pending"
      ).length;
      const confirmed = data.filter(
        (b: Booking) => b.status === "confirmed"
      ).length;
      const revenue = data.reduce(
        (sum: number, b: Booking) => sum + b.totalAmount,
        0
      );

      setStats({
        totalBookings: data.length,
        pendingBookings: pending,
        confirmedBookings: confirmed,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const recentBookings = bookings.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        📊 Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">
            📅
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {stats.totalBookings}
          </div>
          <div className="text-sm text-slate-500">Total Booking</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">
            ⏳
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {stats.pendingBookings}
          </div>
          <div className="text-sm text-slate-500">Menunggu Konfirmasi</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">
            ✓
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {stats.confirmedBookings}
          </div>
          <div className="text-sm text-slate-500">Terkonfirmasi</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">
            💰
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-sm text-slate-500">Total Pendapatan</div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-white">
            📋 Booking Terbaru
          </h2>
          <a
            href="/admin/bookings"
            className="text-teal-500 hover:text-teal-600 text-sm font-medium"
          >
            Lihat Semua →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pax
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Belum ada booking
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-white">
                        {booking.customerName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {formatDateShort(booking.bookingDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {booking.pax} orang
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : booking.status === "cancelled"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
