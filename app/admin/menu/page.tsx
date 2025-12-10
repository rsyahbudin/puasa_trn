"use client";

import { useEffect, useState, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Image,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface VariantOption {
  id?: number;
  name: string;
  price: number;
}

interface MenuVariant {
  id?: number;
  name: string;
  options: VariantOption[];
}

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  categoryId: number;
  category: Category;
  variants: MenuVariant[];
}

interface FormData {
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId: number;
  variants: MenuVariant[];
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMenu, setEditMenu] = useState<Menu | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: 0,
    description: "",
    image: "",
    categoryId: 0,
    variants: [],
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenus(data.menus || []);
      setCategories(data.categories || []);
      if (data.categories?.length > 0 && formData.categoryId === 0) {
        setFormData((prev) => ({ ...prev, categoryId: data.categories[0].id }));
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
    setLoading(false);
  };

  // Handle image upload
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

    // Filter out empty variants and options
    const cleanedVariants = formData.variants
      .filter((v) => v.name.trim() !== "")
      .map((v) => ({
        name: v.name.trim(),
        options: v.options
          .filter((o) => o.name.trim() !== "")
          .map((o) => ({
            name: o.name.trim(),
            price: Number(o.price) || 0,
          })),
      }))
      .filter((v) => v.options.length > 0);

    const payload = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      image: formData.image,
      categoryId: formData.categoryId,
      variants: cleanedVariants,
    };

    console.log("Sending payload:", payload);

    try {
      let res;
      if (editMenu) {
        res = await fetch(`/api/menu/${editMenu.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      console.log("Response:", result);

      if (res.ok) {
        fetchMenus();
        closeModal();
      } else {
        alert("Gagal menyimpan menu: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Gagal menyimpan menu");
    }
    setSaving(false);
  };

  const handleEdit = (menu: Menu) => {
    setEditMenu(menu);
    setFormData({
      name: menu.name,
      price: menu.price,
      description: menu.description || "",
      image: menu.image || "",
      categoryId: menu.categoryId,
      variants: menu.variants.map((v) => ({
        name: v.name,
        options: v.options.map((o) => ({ name: o.name, price: o.price })),
      })),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
      fetchMenus();
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const openAddModal = () => {
    setEditMenu(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      image: "",
      categoryId: categories[0]?.id || 0,
      variants: [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMenu(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      image: "",
      categoryId: categories[0]?.id || 0,
      variants: [],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Variant management
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: "", options: [{ name: "", price: 0 }] },
      ],
    });
  };

  const removeVariant = (index: number) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData({ ...formData, variants: updated });
  };

  const updateVariantName = (index: number, name: string) => {
    const updated = [...formData.variants];
    updated[index].name = name;
    setFormData({ ...formData, variants: updated });
  };

  const addOption = (variantIndex: number) => {
    const updated = [...formData.variants];
    updated[variantIndex].options.push({ name: "", price: 0 });
    setFormData({ ...formData, variants: updated });
  };

  const removeOption = (variantIndex: number, optionIndex: number) => {
    const updated = [...formData.variants];
    updated[variantIndex].options.splice(optionIndex, 1);
    setFormData({ ...formData, variants: updated });
  };

  const updateOption = (
    variantIndex: number,
    optionIndex: number,
    field: "name" | "price",
    value: string | number
  ) => {
    const updated = [...formData.variants];
    if (field === "price") {
      updated[variantIndex].options[optionIndex].price = Number(value) || 0;
    } else {
      updated[variantIndex].options[optionIndex].name = String(value);
    }
    setFormData({ ...formData, variants: updated });
  };

  const filteredMenus = selectedCategory
    ? menus.filter((m) => m.categoryId === selectedCategory)
    : menus;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6" />
          Kelola Menu
        </h1>
        <button
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
          onClick={openAddModal}
        >
          <Plus className="w-5 h-5" />
          Tambah Menu
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === null
              ? "bg-teal-500 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-teal-500 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredMenus.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Tidak ada menu. Klik &quot;Tambah Menu&quot; untuk menambahkan.
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                {menu.image ? (
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">🍽️</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {menu.name}
                  </h3>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    {formatCurrency(menu.price)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                  {menu.description || "Tidak ada deskripsi"}
                </p>

                {/* Show variants count */}
                {menu.variants?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                      {menu.variants.length} varian
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                    {menu.category?.name}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-all"
                      onClick={() => handleEdit(menu)}
                    >
                      ✏️
                    </button>
                    <button
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
                      onClick={() => handleDelete(menu.id)}
                    >
                      🗑️
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
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                {editMenu ? "Edit Menu" : "Tambah Menu"}
              </h3>
              <button
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nama Menu *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Harga Dasar *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: parseInt(e.target.value),
                      })
                    }
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Gambar Menu
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-teal-500 hover:text-teal-500 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage
                        ? "Mengupload..."
                        : formData.image
                        ? "📷 Ganti Gambar"
                        : "📷 Upload Gambar"}
                    </button>
                    {formData.image && (
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
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
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all resize-none"
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Variants Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    🏷️ Varian Menu
                  </h4>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium rounded-lg hover:bg-amber-200 transition-all"
                    onClick={addVariant}
                  >
                    + Tambah Varian
                  </button>
                </div>

                {formData.variants.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    Tidak ada varian. Klik &quot;Tambah Varian&quot; untuk
                    menambahkan pilihan seperti ukuran, level pedas, dll.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.variants.map((variant, vIndex) => (
                      <div
                        key={vIndex}
                        className="border-2 border-slate-200 dark:border-slate-600 rounded-xl p-4"
                      >
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none transition-all"
                            placeholder="Nama Varian (contoh: Pilihan Sambal)"
                            value={variant.name}
                            onChange={(e) =>
                              updateVariantName(vIndex, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            onClick={() => removeVariant(vIndex)}
                          >
                            🗑️
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex-1">Nama Opsi</span>
                            <span className="w-28">Tambahan Harga</span>
                            <span className="w-8"></span>
                          </div>
                          {variant.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex gap-2 items-center"
                            >
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none transition-all text-sm"
                                placeholder="Nama opsi"
                                value={option.name}
                                onChange={(e) =>
                                  updateOption(
                                    vIndex,
                                    oIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                type="number"
                                className="w-28 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-teal-500 outline-none transition-all text-sm"
                                placeholder="0"
                                value={option.price}
                                onChange={(e) =>
                                  updateOption(
                                    vIndex,
                                    oIndex,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="w-8 h-8 text-red-400 hover:text-red-600 transition-all"
                                onClick={() => removeOption(vIndex, oIndex)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                            onClick={() => addOption(vIndex)}
                          >
                            + Tambah Opsi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
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
                    : editMenu
                    ? "Simpan Perubahan"
                    : "Tambah Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
