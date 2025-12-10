"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateShort } from "@/lib/utils";

interface OrderItem {
  id: number;
  menuName: string;
  quantity: number;
  selectedOptions: string | null;
  subtotal: number;
}

interface Booking {
  id: number;
  customerName: string;
  phone: string;
  instagram: string | null;
  bookingDate: string;
  pax: number;
  seating: string;
  totalAmount: number;
  dpAmount: number;
  paymentProof: string | null;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Yakin ingin menghapus booking ini?")) return;
    try {
      await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📅 Daftar Booking</h1>
        <select
          className="select-field w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pelanggan</th>
              <th>Tanggal Booking</th>
              <th>Pax</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-8">
                  Tidak ada booking
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
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
                  <td>
                    <button
                      className="btn btn-outline py-1 px-3 text-sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header flex justify-between items-center">
              <h3 className="font-semibold">
                Detail Booking #{selectedBooking.id}
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="card-body">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-muted">Nama</label>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted">WhatsApp</label>
                  <p className="font-medium">{selectedBooking.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-muted">Instagram</label>
                  <p className="font-medium">
                    {selectedBooking.instagram || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted">Tanggal Booking</label>
                  <p className="font-medium">
                    {formatDateShort(selectedBooking.bookingDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted">Jumlah Orang</label>
                  <p className="font-medium">{selectedBooking.pax} pax</p>
                </div>
                <div>
                  <label className="text-sm text-muted">Spot</label>
                  <p className="font-medium">{selectedBooking.seating}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Pesanan:</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {selectedBooking.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>
                        {item.menuName} x{item.quantity}
                        {item.selectedOptions && (
                          <span className="text-sm text-muted">
                            {" "}
                            ({item.selectedOptions})
                          </span>
                        )}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold">
                    <span>DP (50%):</span>
                    <span>{formatCurrency(selectedBooking.dpAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedBooking.paymentProof && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Bukti Pembayaran:</h4>
                  <img
                    src={selectedBooking.paymentProof}
                    alt="Payment Proof"
                    className="max-w-full h-48 object-contain rounded-lg border"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`badge ${
                    selectedBooking.status === "confirmed"
                      ? "badge-success"
                      : selectedBooking.status === "cancelled"
                      ? "badge-danger"
                      : "badge-warning"
                  }`}
                >
                  Status: {selectedBooking.status}
                </span>
                {selectedBooking.status === "pending" && (
                  <>
                    <button
                      className="btn btn-primary py-1 px-4"
                      onClick={() =>
                        updateStatus(selectedBooking.id, "confirmed")
                      }
                    >
                      ✓ Konfirmasi
                    </button>
                    <button
                      className="btn btn-danger py-1 px-4"
                      onClick={() =>
                        updateStatus(selectedBooking.id, "cancelled")
                      }
                    >
                      ✕ Batalkan
                    </button>
                  </>
                )}
                <button
                  className="btn btn-outline py-1 px-4"
                  onClick={() => deleteBooking(selectedBooking.id)}
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
