'use client'

import { useLanguage } from '@/context/LanguageContext'
import { Language, languages } from '@/lib/i18n'
import { useEffect, useState } from 'react'

export default function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex gap-2 items-center">
      {(Object.keys(languages) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 text-sm font-medium rounded transition ${
            language === lang
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-label={`Switch to ${languages[lang]}`}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
