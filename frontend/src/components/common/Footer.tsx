'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'PRODUCT',
      links: [
        { label: 'Intake Form', href: '#' },
        { label: 'Dashboard', href: '#' },
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'AI Summaries', href: '#' },
        { label: 'Analytics', href: '#' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Partners', href: '#' },
      ],
    },
    {
      title: 'INFORMATION',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Tutorials', href: '#' },
        { label: 'Knowledge Base', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Roadmap', href: '#' },
        { label: 'Status', href: '#' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Support', href: '#' },
        { label: 'Report Issues', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'Compliance', href: '#' },
        { label: 'Disclaimer', href: '#' },
        { label: 'Accessibility', href: '#' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: 'Blog Articles', href: '#' },
        { label: 'Case Studies', href: '#' },
        { label: 'Webinars', href: '#' },
        { label: 'Downloads', href: '#' },
        { label: 'Community', href: '#' },
        { label: 'Feedback', href: '#' },
      ],
    },
  ]

  return (
    <footer style={{ backgroundColor: '#f3f4f6', marginTop: '80px' }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Footer Sections Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition"
                      style={{ color: '#4b5563' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '24px' }}></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div style={{ color: '#6b7280' }} className="text-sm">
            <p>
              &copy; {currentYear} Legal AI Intake Assistant. All rights reserved. | 
              <a 
                href="#" 
                className="transition" 
                style={{ color: '#6b7280', marginLeft: '4px', marginRight: '4px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
              >
                Privacy
              </a>
              | 
              <a 
                href="#" 
                className="transition" 
                style={{ color: '#6b7280', marginLeft: '4px', marginRight: '4px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
              >
                Terms
              </a>
              | 
              <a 
                href="#" 
                className="transition" 
                style={{ color: '#6b7280', marginLeft: '4px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
              >
                Security
              </a>
            </p>
          </div>
          <p style={{ color: '#6b7280' }} className="text-sm mt-4 md:mt-0">
            ⚖️ Legal AI - Streamlining legal intake workflows
          </p>
        </div>
      </div>
    </footer>
  )
}
