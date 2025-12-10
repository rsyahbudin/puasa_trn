"use client";

import { useEffect, useState, useRef } from "react";
import {
  Armchair,
  Plus,
  Pencil,
  Trash2,
  Users,
  X,
  Upload,
  Image,
} from "lucide-react";

interface SeatingSpot {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  capacity: string;
  isActive: boolean;
}

interface FormData {
  name: string;
  description: string;
  image: string;
  capacity: string;
  isActive: boolean;
}

export default function SeatingPage() {
  const [seats, setSeats] = useState<SeatingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editSeat, setEditSeat] = useState<SeatingSpot | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    image: "",
    capacity: "",
    isActive: true,
  });

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await fetch("/api/seating");
      const data = await res.json();
      setSeats(data || []);
    } catch (error) {
      console.error("Error fetching seating:", error);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, image: data.url }));
      } else {
        alert("Upload gagal, silakan coba lagi");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload gagal, silakan coba lagi");
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      capacity: formData.capacity,
      isActive: formData.isActive,
    };

    try {
      let res;
      if (editSeat) {
        res = await fetch(`/api/seating/${editSeat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/seating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        fetchSeats();
        closeModal();
      } else {
        const result = await res.json();
        alert("Gagal menyimpan: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan");
    }
    setSaving(false);
  };

  const handleEdit = (seat: SeatingSpot) => {
    setEditSeat(seat);
    setFormData({
      name: seat.name,
      description: seat.description || "",
      image: seat.image || "",
      capacity: seat.capacity,
      isActive: seat.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus spot ini?")) return;
    try {
      await fetch(`/api/seating/${id}`, { method: "DELETE" });
      fetchSeats();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const openAddModal = () => {
    setEditSeat(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      capacity: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditSeat(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      capacity: "",
      isActive: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Armchair className="w-7 h-7" />
          Kelola Tempat Duduk
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition-all"
          onClick={openAddModal}
        >
          <Plus className="w-5 h-5" />
          Tambah Spot
        </button>
      </div>

      {/* Seating Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seats.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Tidak ada spot tempat duduk. Klik &quot;Tambah Spot&quot; untuk
            menambahkan.
          </div>
        ) : (
          seats.map((seat) => (
            <div
              key={seat.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden hover:shadow-lg transition-all group ${
                seat.isActive
                  ? "border-slate-200 dark:border-slate-700"
                  : "border-red-300 dark:border-red-800 opacity-60"
              }`}
            >
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                {seat.image ? (
                  <img
                    src={seat.image}
                    alt={seat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Armchair className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {seat.name}
                  </h3>
                  {!seat.isActive && (
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                  {seat.description || "Tidak ada deskripsi"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400">
                    <Users className="w-4 h-4" />
                    {seat.capacity}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-all"
                      onClick={() => handleEdit(seat)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
                      onClick={() => handleDelete(seat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                {editSeat ? "Edit Spot" : "Tambah Spot"}
              </h3>
              <button
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nama Spot *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="contoh: Indoor AC"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Kapasitas *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="contoh: 2-10 orang"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all resize-none"
                    rows={2}
                    placeholder="Deskripsi spot"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Gambar Spot
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        "Mengupload..."
                      ) : formData.image ? (
                        <>
                          <Image className="w-5 h-5" />
                          Ganti Gambar
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Gambar
                        </>
                      )}
                    </button>
                    {formData.image && (
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          className="text-red-500 text-sm hover:underline"
                          onClick={() =>
                            setFormData({ ...formData, image: "" })
                          }
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm text-slate-700 dark:text-slate-300"
                  >
                    Aktif (tampilkan di halaman booking)
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:border-slate-400 transition-all"
                  onClick={closeModal}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editSeat
                    ? "Simpan Perubahan"
                    : "Tambah Spot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
