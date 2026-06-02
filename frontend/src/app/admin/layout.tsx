'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="text-2xl font-bold text-blue-600">
              Admin Dashboard
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/sessions"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Sessions
              </Link>
              <Link
                href="/admin/clients"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Clients
              </Link>
              <Link
                href="/admin/team"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Team
              </Link>
              <Link
                href="/admin/reports"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Reports
              </Link>
              <Link
                href="/admin/settings"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Admin Dashboard</h3>
              <p className="text-gray-400">
                Manage intake sessions and team members.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/admin/dashboard" className="hover:text-white transition">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/sessions" className="hover:text-white transition">
                    All Sessions
                  </Link>
                </li>
                <li>
                  <Link href="/admin/reports" className="hover:text-white transition">
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:admin@example.com" className="hover:text-white transition">
                    Admin Support
                  </a>
                </li>
                <li>
                  <a href="tel:+1-555-0123" className="hover:text-white transition">
                    Call Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Intake Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
