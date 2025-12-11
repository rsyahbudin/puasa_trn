"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import * as XLSX from "xlsx";
import {
  CalendarDays,
  Users,
  Wallet,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Save,
} from "lucide-react";

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState<string>("bookingDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: "",
    phone: "",
    instagram: "",
    bookingDate: "",
    pax: 0,
    seating: "",
  });
  const [saving, setSaving] = useState(false);

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
      setIsEditing(false);
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

  const startEdit = (booking: Booking) => {
    setEditForm({
      customerName: booking.customerName,
      phone: booking.phone,
      instagram: booking.instagram || "",
      bookingDate: booking.bookingDate.split("T")[0],
      pax: booking.pax,
      seating: booking.seating,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        fetchBookings();
        setIsEditing(false);
        // Update selectedBooking with new data
        setSelectedBooking({
          ...selectedBooking,
          ...editForm,
          instagram: editForm.instagram || null,
        });
      } else {
        alert("Gagal menyimpan perubahan");
      }
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Gagal menyimpan perubahan");
    }
    setSaving(false);
  };

  // Filter bookings based on search, status, and date
  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (filterStatus && b.status !== filterStatus) return false;

    // Search filter (name, phone, instagram)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = b.customerName.toLowerCase().includes(query);
      const matchesPhone = b.phone.toLowerCase().includes(query);
      const matchesInstagram = b.instagram?.toLowerCase().includes(query);
      if (!matchesName && !matchesPhone && !matchesInstagram) return false;
    }

    // Date filter
    if (startDate) {
      const bookingDate = new Date(b.bookingDate);
      const start = new Date(startDate);
      if (bookingDate < start) return false;
    }
    if (endDate) {
      const bookingDate = new Date(b.bookingDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the end date fully
      if (bookingDate > end) return false;
    }

    return true;
  });

  // Sort filtered bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "customerName":
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case "bookingDate":
        comparison =
          new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
        break;
      case "pax":
        comparison = a.pax - b.pax;
        break;
      case "totalAmount":
        comparison = a.totalAmount - b.totalAmount;
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    );
  };

  // Calculate stats from filtered data
  const filteredStats = {
    total: filteredBookings.length,
    totalPax: filteredBookings.reduce((sum, b) => sum + b.pax, 0),
    totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    pending: filteredBookings.filter((b) => b.status === "pending").length,
    confirmed: filteredBookings.filter((b) => b.status === "confirmed").length,
  };

  // Export to Excel with improved formatting
  const exportToExcel = () => {
    // Create separate columns for each order item for better readability
    const exportData = filteredBookings.map((b) => {
      // Format order items as individual lines
      const pesananFormatted =
        b.orderItems
          ?.map(
            (item, idx) =>
              `${idx + 1}. ${item.menuName} x${item.quantity}${
                item.selectedOptions ? ` (${item.selectedOptions})` : ""
              } = Rp ${item.subtotal.toLocaleString("id-ID")}`
          )
          .join("\n") || "";

      return {
        ID: b.id,
        Nama: b.customerName,
        WhatsApp: `'${b.phone}`, // Prefix with ' to keep as text
        Instagram: b.instagram || "-",
        "Tanggal Booking": formatDateShort(b.bookingDate),
        "Jumlah Orang": b.pax,
        Spot: b.seating,
        "Total (Rp)": b.totalAmount,
        "DP (Rp)": b.dpAmount,
        "Sisa (Rp)": b.totalAmount - b.dpAmount,
        Status: b.status.toUpperCase(),
        "Tanggal Dibuat": formatDateShort(b.createdAt),
        "Pesanan (Detail)": pesananFormatted,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 5 }, // ID
      { wch: 20 }, // Nama
      { wch: 15 }, // WhatsApp
      { wch: 15 }, // Instagram
      { wch: 15 }, // Tanggal Booking
      { wch: 12 }, // Jumlah Orang
      { wch: 12 }, // Spot
      { wch: 15 }, // Total
      { wch: 12 }, // DP
      { wch: 12 }, // Sisa
      { wch: 12 }, // Status
      { wch: 15 }, // Tanggal Dibuat
      { wch: 60 }, // Pesanan (Detail) - wide column for order details
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    // Generate filename with current date
    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `bookings_${today}.xlsx`);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus("");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-7 h-7" />
          Daftar Booking
        </h1>
        <button
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
          onClick={exportToExcel}
        >
          <Download className="w-5 h-5" />
          Export Excel
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="text-xs font-semibold">Booking</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {filteredStats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">Total Pax</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {filteredStats.totalPax}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Pending</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {filteredStats.pending}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">Confirmed</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {filteredStats.confirmed}
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-semibold">Revenue</span>
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
            {formatCurrency(filteredStats.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Cari
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:border-teal-500 outline-none transition-all"
              placeholder="Nama, WhatsApp, atau Instagram..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:border-teal-500 outline-none transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:border-teal-500 outline-none transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:border-teal-500 outline-none cursor-pointer transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm text-slate-500">
            Menampilkan{" "}
            <strong className="text-teal-600">{filteredBookings.length}</strong>{" "}
            dari {bookings.length} booking
          </span>
          {(filterStatus || searchQuery || startDate || endDate) && (
            <button
              className="text-sm text-red-500 hover:text-red-600 underline"
              onClick={clearFilters}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                <th
                  className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-teal-600 group"
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center">
                    Pelanggan
                    <SortIcon field="customerName" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-teal-600"
                  onClick={() => handleSort("bookingDate")}
                >
                  <div className="flex items-center">
                    Tanggal
                    <SortIcon field="bookingDate" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-teal-600"
                  onClick={() => handleSort("pax")}
                >
                  <div className="flex items-center">
                    Pax
                    <SortIcon field="pax" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Spot
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-teal-600"
                  onClick={() => handleSort("totalAmount")}
                >
                  <div className="flex items-center">
                    Total
                    <SortIcon field="totalAmount" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-teal-600"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    {bookings.length === 0
                      ? "Tidak ada booking"
                      : "Tidak ada hasil yang cocok dengan filter"}
                  </td>
                </tr>
              ) : (
                sortedBookings.map((booking) => (
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
                      {booking.instagram && (
                        <div className="text-sm text-teal-500">
                          @{booking.instagram.replace("@", "")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {formatDateShort(booking.bookingDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {booking.pax}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {booking.seating}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {/* Confirm Button */}
                        {booking.status === "pending" && (
                          <button
                            className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all"
                            onClick={() =>
                              updateStatus(booking.id, "confirmed")
                            }
                            title="Konfirmasi"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {/* Cancel Button */}
                        {booking.status !== "cancelled" && (
                          <button
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                            onClick={() =>
                              updateStatus(booking.id, "cancelled")
                            }
                            title="Batalkan"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {/* Detail Button */}
                        <button
                          className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all"
                          onClick={() => setSelectedBooking(booking)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                {isEditing ? "Edit Booking" : "Detail Booking"} #
                {selectedBooking.id}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-all"
                    onClick={() => startEdit(selectedBooking)}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center"
                  onClick={() => {
                    setSelectedBooking(null);
                    setIsEditing(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                // Edit Form
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Nama:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none"
                      value={editForm.customerName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      WhatsApp:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Instagram:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none"
                      value={editForm.instagram}
                      onChange={(e) =>
                        setEditForm({ ...editForm, instagram: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Tanggal:
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none"
                      value={editForm.bookingDate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          bookingDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Jumlah Orang:
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none"
                      value={editForm.pax}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          pax: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Spot:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none"
                      value={editForm.seating}
                      onChange={(e) =>
                        setEditForm({ ...editForm, seating: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-slate-500">Nama:</span>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {selectedBooking.customerName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">WhatsApp:</span>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {selectedBooking.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Instagram:</span>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {selectedBooking.instagram || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Tanggal:</span>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {formatDateShort(selectedBooking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">
                      Jumlah Orang:
                    </span>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {selectedBooking.pax} pax
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Spot:</span>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {selectedBooking.seating}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">
                  Pesanan:
                </h4>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                  {selectedBooking.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.menuName} x{item.quantity}
                        {item.selectedOptions && (
                          <span className="text-slate-400">
                            {" "}
                            ({item.selectedOptions})
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div>
                  <div className="text-sm text-slate-500">
                    Total: {formatCurrency(selectedBooking.totalAmount)}
                  </div>
                  <div className="text-lg font-bold text-teal-600">
                    DP: {formatCurrency(selectedBooking.dpAmount)}
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedBooking.status === "confirmed"
                      ? "bg-green-100 text-green-600"
                      : selectedBooking.status === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {selectedBooking.status.toUpperCase()}
                </span>
              </div>

              {selectedBooking.paymentProof && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">
                    Bukti Pembayaran:
                  </h4>
                  <img
                    src={selectedBooking.paymentProof}
                    alt="Payment Proof"
                    className="max-w-xs rounded-lg border shadow"
                  />
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {isEditing ? (
                  <>
                    <button
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all"
                      onClick={cancelEdit}
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    {selectedBooking.status === "pending" && (
                      <button
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                        onClick={() =>
                          updateStatus(selectedBooking.id, "confirmed")
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                        Konfirmasi
                      </button>
                    )}
                    {selectedBooking.status !== "cancelled" && (
                      <button
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                        onClick={() =>
                          updateStatus(selectedBooking.id, "cancelled")
                        }
                      >
                        <XCircle className="w-4 h-4" />
                        Batalkan
                      </button>
                    )}
                    <button
                      className="px-4 py-2 border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold rounded-xl transition-all flex items-center gap-2"
                      onClick={() => deleteBooking(selectedBooking.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
