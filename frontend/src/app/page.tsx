'use client'

import Link from 'next/link'
import { ArrowRight, FileText, Brain, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">⚖️ Legal AI</div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Legal Intake
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Collect structured client information, generate AI summaries, and prepare consultation notes—all in one platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/intake" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              Start Intake <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard" className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <FileText className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Structured Intake</h3>
            <p className="text-gray-600">
              Guided step-by-step intake flow that collects all necessary information systematically.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Brain className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
            <p className="text-gray-600">
              Automatic case summaries, legal category detection, and missing information alerts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Shield className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Enterprise-grade security with encrypted storage and role-based access control.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-12 mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8">
            Start collecting structured legal intake data today.
          </p>
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Legal AI Intake Assistant. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">
            This is not legal advice. Always consult with a qualified attorney.
          </p>
        </div>
      </footer>
    </div>
  )
}
