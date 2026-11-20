import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Language, type TranslationDict } from '../i18n/translations'
import { Globe, Check, ChevronDown } from 'lucide-react'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: TranslationDict
  isZh: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('ascend_lang') as Language
    return saved === 'en' || saved === 'cn' ? saved : 'en'
  })

  useEffect(() => {
    localStorage.setItem('ascend_lang', lang)
    document.documentElement.lang = lang === 'cn' ? 'zh-Hans' : 'en'
  }, [lang])

  function setLang(newLang: Language) {
    setLangState(newLang === 'cn' ? 'cn' : 'en')
  }

  const value: LanguageContextValue = {
    lang,
    setLang,
    t: translations[lang] || translations.en,
    isZh: lang === 'cn',
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}

export const LANGUAGE_OPTIONS: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'cn', label: '简体中文', short: '中文' },
]

export function LanguageSwitcher({ className = '' }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const current = LANGUAGE_OPTIONS.find((opt) => opt.code === lang) || LANGUAGE_OPTIONS[0]

  return (
    <div className={`relative inline-block text-left select-none z-50 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-orange-50 text-[#FF5A36] hover:bg-orange-100 border border-orange-200/80 transition-all cursor-pointer"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span>{current.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl shadow-xl z-[999] overflow-hidden border-2 border-orange-100 py-1.5 bg-white">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLang(opt.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors cursor-pointer ${
                  lang === opt.code
                    ? 'bg-orange-50 text-[#FF5A36] font-extrabold'
                    : 'text-slate-600 hover:bg-orange-50/50 hover:text-[#FF5A36]'
                }`}
              >
                <span>{opt.label}</span>
                {lang === opt.code && <Check className="h-3.5 w-3.5 text-[#FF5A36]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
