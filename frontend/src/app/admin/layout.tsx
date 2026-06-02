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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#a855f7' }}></div>
          <p style={{ color: '#4b5563' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="text-2xl font-bold" style={{ color: '#a855f7' }}>
              Intake Assistant
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/admin/dashboard"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/intakes"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Intakes
              </Link>
              <Link
                href="/admin/sessions"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Sessions
              </Link>
              <Link
                href="/admin/clients"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Clients
              </Link>
              <Link
                href="/admin/team"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Team
              </Link>
              <Link
                href="/admin/reports"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Reports
              </Link>
              <Link
                href="/admin/settings"
                className="transition"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: '#4b5563' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white rounded-lg transition font-medium"
              style={{ backgroundColor: '#ef4444' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
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
      <footer style={{ backgroundColor: '#ffffff', marginTop: '48px', borderTop: '1px solid #e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Admin Dashboard</h3>
              <p style={{ color: '#4b5563' }}>
                Manage intake sessions and team members.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/admin/dashboard" 
                    className="transition"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/sessions" 
                    className="transition"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    All Sessions
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/reports" 
                    className="transition"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Support</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="mailto:admin@example.com" 
                    className="transition"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    Admin Support
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+1-555-0123" 
                    className="transition"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    Call Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '32px', paddingTop: '32px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            <p>&copy; 2026 Intake Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
