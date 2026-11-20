import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Language, type TranslationDict } from '../i18n/translations'
import { ChevronDown, Check } from 'lucide-react'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: TranslationDict
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('asianmum_lang') as Language
    return (saved === 'bm' || saved === 'en' || saved === 'cn') ? saved : 'bm'
  })

  useEffect(() => {
    localStorage.setItem('asianmum_lang', lang)
    document.documentElement.lang = lang === 'cn' ? 'zh-Hans' : lang === 'bm' ? 'ms' : 'en'
  }, [lang])

  function setLang(newLang: Language) {
    setLangState(newLang)
  }

  const value: LanguageContextValue = {
    lang,
    setLang,
    t: translations[lang] || translations.bm,
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

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'bm', label: 'B. Melayu', flag: '🇲🇾' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'cn', label: '简体中文',  flag: '🇨🇳' },
]

export function LanguageSwitcher({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const { lang, setLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const current = LANGUAGE_OPTIONS.find(opt => opt.code === lang) || LANGUAGE_OPTIONS[0]

  return (
    <div className={`relative inline-block text-left select-none z-50 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          dark
            ? 'bg-white/15 text-white hover:bg-white/25 border border-white/25 shadow-xs'
            : 'bg-white text-emerald-950 hover:bg-emerald-50 border border-emerald-900/20 shadow-xs'
        }`}
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="font-bold text-xs">{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown Menu */}
          <div
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-2xl z-[999] overflow-hidden border border-emerald-900/15 py-1.5 bg-white animate-in fade-in zoom-in-95 duration-150"
            style={{ minWidth: '160px' }}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <button
                key={opt.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setLang(opt.code)
                  setIsOpen(false)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setLang(opt.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors cursor-pointer ${
                  lang === opt.code
                    ? 'bg-emerald-100/80 text-emerald-950 font-black'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{opt.flag}</span>
                  <span className="text-xs">{opt.label}</span>
                </div>
                {lang === opt.code && <Check className="h-3.5 w-3.5 text-emerald-800" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
