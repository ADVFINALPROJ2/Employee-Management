import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Employee Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-50">{children}</main>
          </div>
          <Toaster />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
