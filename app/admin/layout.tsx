"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(!!admin);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    router.push("/admin/login");
  };

  // Show login page without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/bookings", label: "Booking", icon: "📅" },
    { href: "/admin/menu", label: "Menu", icon: "🍽️" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">🌙 Admin Panel</h1>
          <p className="text-sm text-muted">Restoran Buka Puasa</p>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${
                pathname === link.href ? "active" : ""
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleLogout} className="btn btn-outline w-full">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content flex-1">{children}</main>
    </div>
  );
}
