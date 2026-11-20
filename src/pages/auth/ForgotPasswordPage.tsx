import { useState } from 'react'
import { authApi } from '../../api/auth'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useLanguage, LanguageSwitcher } from '../../contexts/LanguageContext'

const LOGO  = '/images/logo.png'
const OLIVE = '#2F4C2C'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #111D12 0%, #1A2B18 50%, #0F1A10 100%)' }}
      >
        <div className="card text-center max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-emerald-900/10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">{t.auth.resetSentTitle}</h2>
          <p className="text-xs text-gray-600 mb-6">
            {t.auth.resetSentDesc}
          </p>
          <Link
            to="/login"
            className="btn-primary w-full py-3 text-xs font-bold shadow-md inline-block text-center"
          >
            {t.auth.loginHere}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between px-4 py-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #111D12 0%, #1A2B18 50%, #0F1A10 100%)' }}
    >
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-30 relative">
        <Link to="/login" className="text-xs font-bold text-emerald-200 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> {t.auth.backToHome}
        </Link>
        <LanguageSwitcher dark />
      </div>

      <div className="max-w-md w-full mx-auto my-auto z-10">
        <div className="flex justify-center mb-6">
          <img src={LOGO} alt="Asian Mum" className="h-14 w-auto rounded-2xl bg-white p-1 shadow-lg" />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-emerald-900/10">
          <h2 className="text-xl font-black text-gray-900 mb-1">{t.auth.forgotPasswordTitle}</h2>
          <p className="text-xs text-gray-500 mb-6">
            {t.auth.forgotPasswordSubtitle}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t.auth.emailLabel}</label>
              <input
                type="email"
                required
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-none text-gray-900"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${OLIVE}, #4E7749)` }}
            >
              {loading ? t.auth.sending : t.auth.sendResetLink}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto text-center text-xs text-emerald-200/50 z-10 pt-4">
        © {new Date().getFullYear()} Asian Mum.
      </div>
    </div>
  )
}
