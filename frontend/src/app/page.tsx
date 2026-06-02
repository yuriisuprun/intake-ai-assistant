'use client'

import Link from 'next/link'
import { ArrowRight, FileText, Brain, Shield } from 'lucide-react'
import Footer from '@/components/common/Footer'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold" style={{ color: '#a855f7' }}>⚖️ Intake Assistant</div>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="text-white px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: '#a855f7' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9333ea')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a855f7')}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#111827' }}>
            Streamline Legal Intake
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#4b5563' }}>
            Collect structured client information, generate AI summaries, and prepare consultation notes—all in one platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/intake" 
              className="text-white px-8 py-3 rounded-lg flex items-center gap-2 transition"
              style={{ backgroundColor: '#a855f7' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9333ea')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a855f7')}>
              Start Intake<ArrowRight size={20} />
            </Link>
            <Link 
              href="/admin/dashboard" 
              className="px-8 py-3 rounded-lg transition"
              style={{ 
                backgroundColor: '#ffffff',
                color: '#a855f7',
                border: '2px solid #a855f7'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf5ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Login to Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-lg" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <FileText className="mb-4" size={32} style={{ color: '#a855f7' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Structured Intake</h3>
            <p style={{ color: '#4b5563' }}>
              Guided step-by-step intake flow that collects all necessary information systematically.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <Brain className="mb-4" size={32} style={{ color: '#a855f7' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>AI Summaries</h3>
            <p style={{ color: '#4b5563' }}>
              Automatic case summaries, legal category detection, and missing information alerts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <Shield className="mb-4" size={32} style={{ color: '#a855f7' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Secure & Private</h3>
            <p style={{ color: '#4b5563' }}>
              Enterprise-grade security with encrypted storage and role-based access control.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-lg p-12 mt-20 text-center" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#111827' }}>Ready to get started?</h2>
          <p className="mb-8" style={{ color: '#4b5563' }}>
            Start collecting structured legal intake data today.
          </p>
          <Link 
            href="/signup" 
            className="text-white px-8 py-3 rounded-lg inline-block transition"
            style={{ backgroundColor: '#a855f7' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9333ea')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a855f7')}
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
