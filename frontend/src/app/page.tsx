'use client'

import Link from 'next/link'
import { ArrowRight, FileText, Brain, Shield } from 'lucide-react'
import Footer from '@/components/common/Footer'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Navigation */}
      <nav className="bg-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">📋 Intake Assistant</div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#111827' }}>
            {t('home.title')}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#4b5563' }}>
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/intake" 
              className="text-white px-8 py-3 rounded-lg flex items-center gap-2 transition"
              style={{ backgroundColor: '#a855f7' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9333ea')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a855f7')}>
              {t('home.startIntake')}<ArrowRight size={20} />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-3 rounded-lg transition"
              style={{ 
                backgroundColor: '#ffffff',
                color: '#a855f7',
                border: '2px solid #a855f7'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf5ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              {t('home.loginDashboard')}
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 mb-8">
          <div className="bg-white p-8 rounded-lg" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <FileText className="mb-4" size={32} style={{ color: '#a855f7' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
              {t('features.structured.title')}
            </h3>
            <p style={{ color: '#4b5563' }}>
              {t('features.structured.desc')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <Brain className="mb-4" size={32} style={{ color: '#a855f7' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
              {t('features.ai.title')}
            </h3>
            <p style={{ color: '#4b5563' }}>
              {t('features.ai.desc')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <Shield className="mb-4" size={32} style={{ color: '#a855f7' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
              {t('features.secure.title')}
            </h3>
            <p style={{ color: '#4b5563' }}>
              {t('features.secure.desc')}
            </p>
          </div>
        </div>


      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
