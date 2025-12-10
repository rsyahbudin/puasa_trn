"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Wallet,
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3,
} from "lucide-react";

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
  totalPax: number;
}

interface DailyData {
  date: string;
  bookings: number;
  pax: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalPax: 0,
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
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
      const pax = data.reduce((sum: number, b: Booking) => sum + b.pax, 0);

      setStats({
        totalBookings: data.length,
        pendingBookings: pending,
        confirmedBookings: confirmed,
        totalRevenue: revenue,
        totalPax: pax,
      });

      // Generate daily data for chart (last 7 days)
      const last7Days: DailyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayBookings = data.filter(
          (b: Booking) => b.bookingDate.split("T")[0] === dateStr
        );
        last7Days.push({
          date: dateStr,
          bookings: dayBookings.length,
          pax: dayBookings.reduce((sum: number, b: Booking) => sum + b.pax, 0),
          revenue: dayBookings.reduce(
            (sum: number, b: Booking) => sum + b.totalAmount,
            0
          ),
        });
      }
      setDailyData(last7Days);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const recentBookings = bookings.slice(0, 5);
  const maxBookings = Math.max(...dailyData.map((d) => d.bookings), 1);
  const maxPax = Math.max(...dailyData.map((d) => d.pax), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-7 h-7" />
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {stats.totalBookings}
          </div>
          <div className="text-xs md:text-sm text-slate-500">Total Booking</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {stats.totalPax}
          </div>
          <div className="text-xs md:text-sm text-slate-500">Total Pax</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {stats.pendingBookings}
          </div>
          <div className="text-xs md:text-sm text-slate-500">Menunggu</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {stats.confirmedBookings}
          </div>
          <div className="text-xs md:text-sm text-slate-500">Terkonfirmasi</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4">
            <Wallet className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            Total Pendapatan
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Booking Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Booking 7 Hari Terakhir
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {dailyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-28">
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500"
                    style={{
                      height: `${(day.bookings / maxBookings) * 100}%`,
                      minHeight: day.bookings > 0 ? "8px" : "2px",
                    }}
                    title={`${day.bookings} booking`}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {new Date(day.date).toLocaleDateString("id-ID", {
                    weekday: "short",
                  })}
                </div>
                <div className="text-xs font-semibold text-teal-600">
                  {day.bookings}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pax Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Total Pax 7 Hari Terakhir
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {dailyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-28">
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                    style={{
                      height: `${(day.pax / maxPax) * 100}%`,
                      minHeight: day.pax > 0 ? "8px" : "2px",
                    }}
                    title={`${day.pax} orang`}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {new Date(day.date).toLocaleDateString("id-ID", {
                    weekday: "short",
                  })}
                </div>
                <div className="text-xs font-semibold text-blue-600">
                  {day.pax}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Booking Terbaru
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
