"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface VariantOption {
  id: number;
  name: string;
}

interface MenuVariant {
  id: number;
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

interface MenuFormData {
  name: string;
  price: string;
  description: string;
  image: string;
  categoryId: string;
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    price: "",
    description: "",
    image: "",
    categoryId: "",
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      setMenus(data.menus || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await fetch(`/api/menu/${editingMenu.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      fetchMenus();
      resetForm();
    } catch (error) {
      console.error("Error saving menu:", error);
    }
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      price: menu.price.toString(),
      description: menu.description || "",
      image: menu.image || "",
      categoryId: menu.categoryId.toString(),
    });
    setShowForm(true);
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

  const resetForm = () => {
    setShowForm(false);
    setEditingMenu(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      categoryId: "",
    });
  };

  const filteredMenus =
    filterCategory === "all"
      ? menus
      : menus.filter((m) => m.categoryId.toString() === filterCategory);

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
        <h1 className="text-2xl font-bold">🍽️ Kelola Menu</h1>
        <div className="flex gap-2">
          <select
            className="select-field w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Tambah Menu
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenus.map((menu) => (
          <div key={menu.id} className="card">
            <div
              className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20"
              style={{
                backgroundImage: menu.image ? `url(${menu.image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!menu.image && (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🍽️
                </div>
              )}
            </div>
            <div className="card-body">
              <span className="badge badge-primary text-xs mb-2">
                {menu.category.name}
              </span>
              <h3 className="font-semibold mb-1">{menu.name}</h3>
              <p className="text-sm text-muted mb-2 line-clamp-2">
                {menu.description}
              </p>
              <p className="text-primary font-bold mb-4">
                {formatCurrency(menu.price)}
              </p>
              {menu.variants.length > 0 && (
                <div className="text-xs text-muted mb-2">
                  Varian: {menu.variants.map((v) => v.name).join(", ")}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="btn btn-outline py-1 px-3 text-sm flex-1"
                  onClick={() => handleEdit(menu)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger py-1 px-3 text-sm"
                  onClick={() => handleDelete(menu.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMenus.length === 0 && (
        <div className="text-center py-12 text-muted">
          Belum ada menu. Klik &quot;Tambah Menu&quot; untuk menambahkan.
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 className="font-semibold">
                {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Nama Menu *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Harga (Rp) *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Kategori *</label>
                  <select
                    className="select-field"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Deskripsi</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">URL Gambar</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="/menu/gambar.jpg"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-outline flex-1"
                    onClick={resetForm}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingMenu ? "Simpan Perubahan" : "Tambah Menu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
