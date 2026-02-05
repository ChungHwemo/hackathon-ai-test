import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import ja from '../locales/ja.json'
import en from '../locales/en.json'

type Locale = 'ja' | 'en'
type Translations = typeof ja

const translations: Record<Locale, Translations> = { ja, en }

interface I18nContextValue {
  locale: Locale
  t: (key: string, params?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ja')

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = getNestedValue(translations[locale] as unknown as Record<string, unknown>, key)
      return params ? interpolate(value, params) : value
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
