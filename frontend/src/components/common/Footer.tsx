'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">⚖️ Legal AI</h3>
            <p className="text-gray-400 text-sm mb-4">
              Streamline legal intake with AI-powered summaries and structured data collection.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/intake" className="text-gray-400 hover:text-white transition text-sm">
                  Intake Form
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <a href="mailto:support@legalai.com" className="text-white hover:text-blue-400 transition">
                  support@legalai.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <a href="tel:+1-800-LEGAL-AI" className="text-white hover:text-blue-400 transition">
                  +1 (800) LEGAL-AI
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Legal AI Intake Assistant. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              ⚠️ This is not legal advice. Always consult with a qualified attorney.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
