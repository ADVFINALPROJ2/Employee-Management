"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/api";

interface LinkItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
  employeeOnly?: boolean;
}

interface LinkGroup {
  group: string;
  items: LinkItem[];
}

const sidebarLinks: LinkGroup[] = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: "📊", adminOnly: true },
      { label: "Employee Dashboard", href: "/dashboard/employee", icon: "👤", employeeOnly: true },
    ],
  },
  {
    group: "Employees",
    items: [
      { label: "All Employees", href: "/employees", icon: "👥", adminOnly: true },
      { label: "Add Employee", href: "/employees/add", icon: "➕", adminOnly: true },
    ],
  },
  {
    group: "Leave",
    items: [
      { label: "Request Leave", href: "/leave/request", icon: "📝" },
      { label: "Admin View", href: "/leave/admin", icon: "✅", adminOnly: true },
    ],
  },
  {
    group: "Grievance",
    items: [
      { label: "Submit", href: "/grievance", icon: "📢" },
      { label: "Admin View", href: "/grievance/admin", icon: "⚙️", adminOnly: true },
    ],
  },

];

const publicPaths = ["/login", "/forgot-password", "/reset-password"];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setRole(user?.role || null);
  }, [pathname]);

  if (publicPaths.includes(pathname)) return null;

  const filteredGroups = sidebarLinks
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (!item.adminOnly || role === "Admin") &&
          (!item.employeeOnly || role !== "Admin")
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="sticky top-0 self-start h-screen w-60 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto hidden md:block">
      <div className="py-4">
        {filteredGroups.map((group) => (
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
