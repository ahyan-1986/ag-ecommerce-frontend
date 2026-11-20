import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AscendLogo } from '../../components/brand/AscendLogo'

const DEMO_ACCOUNTS = [
  { label: 'Three Star Leader (Elena)', email: 'leader@ascendgroup.my', rank: 'S3' },
  { label: 'Member (Maya)', email: 'maya@ascendgroup.my', rank: 'M' },
  { label: 'Admin Backoffice', email: 'admin@ascendgroup.my', rank: 'Admin' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login({ email, password })
      if (u.role === 'admin' || u.role === 'super_admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4F1] via-[#FFFBEB] to-[#ECFEF9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <AscendLogo size="lg" showTagline />
          </Link>
        </div>

        <div className="bg-white rounded-[2rem] border-2 border-orange-100 shadow-pop p-7 sm:p-9 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back!</h1>
            <p className="text-xs text-slate-500 mt-1">Sign in to your Ascend Group account &amp; rewards portal</p>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@ascendgroup.my"
                  className="input !pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#FF5A36] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input !pl-10"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="pt-4 border-t border-orange-100 space-y-2.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" /> Quick Demo Login (Password123)
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email)
                    setPassword('Password123')
                  }}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/80 text-xs font-bold text-slate-700 transition"
                >
                  <span>{acc.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-[#FF5A36] border border-orange-200">
                    {acc.rank}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs font-semibold text-slate-500">
            New to Ascend Group?{' '}
            <Link to="/register" className="font-extrabold text-[#FF5A36] hover:underline">
              Create your free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
