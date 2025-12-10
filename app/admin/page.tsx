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

      // Calculate stats
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
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="icon bg-primary/10 text-primary">📅</div>
          <div className="value">{stats.totalBookings}</div>
          <div className="label">Total Booking</div>
        </div>
        <div className="stat-card">
          <div className="icon bg-yellow-100 text-yellow-600">⏳</div>
          <div className="value">{stats.pendingBookings}</div>
          <div className="label">Menunggu Konfirmasi</div>
        </div>
        <div className="stat-card">
          <div className="icon bg-green-100 text-green-600">✓</div>
          <div className="value">{stats.confirmedBookings}</div>
          <div className="label">Terkonfirmasi</div>
        </div>
        <div className="stat-card">
          <div className="icon bg-secondary/10 text-secondary">💰</div>
          <div className="value text-lg">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="label">Total Pendapatan</div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="font-semibold">📋 Booking Terbaru</h2>
          <a
            href="/admin/bookings"
            className="text-primary text-sm font-medium hover:underline"
          >
            Lihat Semua →
          </a>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Tanggal</th>
                <th>Pax</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-8">
                    Belum ada booking
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-muted">{booking.phone}</div>
                    </td>
                    <td>{formatDateShort(booking.bookingDate)}</td>
                    <td>{booking.pax} orang</td>
                    <td className="font-medium">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === "confirmed"
                            ? "badge-success"
                            : booking.status === "cancelled"
                            ? "badge-danger"
                            : "badge-warning"
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
