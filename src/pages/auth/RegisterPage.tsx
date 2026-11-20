import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { User, Mail, Phone, Lock, Users, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { affiliateApi } from '../../api/affiliate'
import { AscendLogo } from '../../components/brand/AscendLogo'

export default function RegisterPage() {
  const { referralCode: paramRef } = useParams()
  const [searchParams] = useSearchParams()
  const initialRef = paramRef || searchParams.get('ref') || ''

  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState(initialRef)
  const [sponsorName, setSponsorName] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const code = referralCode.trim()
    if (!code) {
      setSponsorName(null)
      return
    }
    const t = setTimeout(() => {
      affiliateApi
        .verifyReferralCode(code)
        .then((res) => setSponsorName(res.valid ? res.sponsorName : null))
        .catch(() => setSponsorName(null))
    }, 350)
    return () => clearTimeout(t)
  }, [referralCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        referralCode: referralCode.trim() || undefined,
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4F1] via-[#FFFBEB] to-[#ECFEF9] flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <AscendLogo size="lg" showTagline />
          </Link>
        </div>

        <div className="bg-white rounded-[2rem] border-2 border-orange-100 shadow-pop p-7 sm:p-9 space-y-6">
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#00A37B] text-[11px] font-extrabold">
              <Sparkles className="w-3.5 h-3.5" /> Free Ascend Circle Membership
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Create Your Account</h1>
            <p className="text-xs text-slate-500">
              Start earning 15% Loyalty Points on every order &amp; unlock guest points held on your email!
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Maya"
                    className="input !pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Chong"
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="input !pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0123456789"
                  className="input !pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password (min. 8 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="input !pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Referral / Sponsor Code (Optional)</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ELENA888"
                  className="input !pl-10 font-mono uppercase"
                />
              </div>
              {sponsorName && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00A37B]">
                  <CheckCircle2 className="w-4 h-4" /> Invited by {sponsorName}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
              {loading ? 'Creating Account...' : 'Join Ascend Group'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs font-semibold text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-[#FF5A36] hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
