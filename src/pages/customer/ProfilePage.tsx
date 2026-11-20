import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { User, Copy, Check, Building2, Users, CheckCircle2, Sparkles } from 'lucide-react'
import { usersApi } from '../../api/users'
import { walletApi } from '../../api/wallet'
import { affiliateApi } from '../../api/affiliate'
import { useAuth } from '../../contexts/AuthContext'
import { TierBadge } from '../../components/tier/TierBadge'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const qc = useQueryClient()
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [bankName, setBankName] = useState(user?.bankName || '')
  const [bankAccountNo, setBankAccountNo] = useState(user?.bankAccountNo || '')
  const [payeeName, setPayeeName] = useState(user?.payeeName || '')
  const [payeeIdNo, setPayeeIdNo] = useState(user?.payeeIdNo || '')

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName || '')
    setLastName(user.lastName || '')
    setPhone(user.phone || '')
    setBankName(user.bankName || '')
    setBankAccountNo(user.bankAccountNo || '')
    setPayeeName(user.payeeName || '')
    setPayeeIdNo(user.payeeIdNo || '')
  }, [user])

  const update = useMutation({
    mutationFn: () =>
      usersApi.updateProfile({
        firstName,
        lastName,
        phone,
        bankName,
        bankAccountNo,
        payeeName,
        payeeIdNo,
      } as any),
    onSuccess: async () => {
      await refreshUser?.()
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['withdrawal-info'] })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const { data: wallet } = useQuery({ queryKey: ['my-wallet'], queryFn: walletApi.getMyWallet })
  const { data: sponsor } = useQuery({ queryKey: ['my-sponsor'], queryFn: affiliateApi.mySponsor })

  const loyaltyPoints = wallet?.pointsBalance || 0
  const referralUrl = user?.referralCode ? `${window.location.origin}/register/${user.referralCode}` : ''

  async function handleCopy() {
    if (referralUrl) {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-7">
      {/* ── Vibrant Dopamine Member Identity Card ────────────────────────── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FF5A36] via-[#FF8A00] to-[#FFB800] text-white relative overflow-hidden shadow-pop">
        <div className="absolute -right-12 -bottom-12 w-52 h-52 rounded-full bg-white/15 blur-xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black bg-white/25 border-2 border-white/40 shrink-0">
              {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-xs text-white/85 mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <TierBadge rank={user?.memberRank || user?.highestRank} size="sm" />
                {user?.memberCode && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                    ID: {user.memberCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3.5 border border-white/30">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/85">Available Loyalty Points</p>
            <p className="text-3xl font-black mt-0.5">{loyaltyPoints.toFixed(2)} pts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Personal + Bank / Payee Form (Aameba origin/dev Profile) ──── */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border-2 border-orange-100 shadow-soft space-y-6">
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Profile &amp; Bank Details saved! You are ready to redeem rewards anytime.
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-orange-100 pb-3">
              <User className="w-4 h-4 text-[#FF5A36]" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Mobile Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {/* Bank / Payee Section (Required for Redeem Rewards) */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-orange-100 pb-3">
              <Building2 className="w-4 h-4 text-[#00A37B]" /> Bank Account &amp; Payee Details
              <span className="text-[10px] font-bold text-[#00A37B] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                For Redeem Rewards
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bank Name</label>
                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Maybank Berhad, CIMB Bank"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bank Account Number</label>
                <input
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="e.g. 514288019283"
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">Payee Full Name (as per Bank)</label>
                <input
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. MAYA CHONG XIN YI"
                  className="input"
                />
              </div>
              <div>
                <label className="label">NRIC / Passport Number</label>
                <input
                  value={payeeIdNo}
                  onChange={(e) => setPayeeIdNo(e.target.value)}
                  placeholder="e.g. 961108-14-3328"
                  className="input font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => update.mutate()}
            disabled={update.isPending}
            className="btn-primary !px-8"
          >
            {update.isPending ? 'Saving...' : 'Save Profile & Bank Details'}
          </button>
        </div>

        {/* ── Right Column: Invited By (Sponsor) + Share QR ─────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-soft space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00C896]" /> Invited By (Sponsor)
            </h3>
            {sponsor?.hasSponsor ? (
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4 space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">
                  {sponsor.firstName} {sponsor.lastName}
                </p>
                <p className="text-xs font-mono font-bold text-[#00A37B]">{sponsor.referralCode}</p>
                <p className="text-[11px] text-slate-500">{sponsor.email}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Direct Ascend Group Member</p>
            )}
          </div>

          {referralUrl && (
            <div className="bg-gradient-to-br from-[#FFF7F2] to-[#FFFBEB] rounded-3xl p-6 border-2 border-orange-100 shadow-soft text-center space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FF5A36] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> My Invite QR Code
              </p>
              <div className="inline-block bg-white p-3.5 rounded-2xl shadow-sm border border-orange-100">
                <QRCodeSVG value={referralUrl} size={148} fgColor="#1E293B" />
              </div>
              <button onClick={handleCopy} className="btn-outline w-full !text-xs">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Link Copied!' : 'Copy Referral Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
