"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: "📊" },
      { label: "Employee Dashboard", href: "/dashboard/employee", icon: "👤" },
    ],
  },
  {
    group: "Employees",
    items: [
      { label: "All Employees", href: "/employees", icon: "👥" },
      { label: "Add Employee", href: "/employees/add", icon: "➕" },
    ],
  },
  {
    group: "Attendance",
    items: [
      { label: "My Attendance", href: "/attendance", icon: "⏱️" },
      { label: "Admin View", href: "/attendance/admin", icon: "📋" },
    ],
  },
  {
    group: "Leave",
    items: [
      { label: "Request Leave", href: "/leave/request", icon: "📝" },
      { label: "Admin View", href: "/leave/admin", icon: "✅" },
    ],
  },
  {
    group: "Grievance",
    items: [
      { label: "Submit", href: "/grievance", icon: "📢" },
      { label: "Admin View", href: "/grievance/admin", icon: "⚙️" },
    ],
  },
  {
    group: "Other",
    items: [
      { label: "Portfolio", href: "/portfolio", icon: "💼" },
    ],
  },
];

const publicPaths = ["/login", "/forgot-password", "/reset-password"];

export default function Sidebar() {
  const pathname = usePathname();

  if (publicPaths.includes(pathname)) return null;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto hidden md:block">
      <div className="py-4">
        {sidebarLinks.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {group.group}
            </p>
            {group.items.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
