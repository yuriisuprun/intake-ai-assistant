'use client'

import { useLanguage } from '@/context/LanguageContext'
import { t } from '@/lib/i18n'

export function useTranslation() {
  const { language } = useLanguage()

  return {
    t: (key: string, params?: Record<string, string>) => t(key, language, params),
  }
}
