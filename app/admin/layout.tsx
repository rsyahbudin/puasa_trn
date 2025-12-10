"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  Armchair,
  LogOut,
  Home,
} from "lucide-react";

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

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Booking", icon: CalendarDays },
    { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/admin/seating", label: "Tempat Duduk", icon: Armchair },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 fixed h-full hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Admin Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Teras Rumah Nenek
          </p>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  pathname === link.href
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-xl hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Admin
          </h1>
          <div className="flex gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-2 rounded-lg ${
                    pathname === link.href
                      ? "bg-teal-500 text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 mt-16 md:mt-0">{children}</main>
    </div>
  );
}
