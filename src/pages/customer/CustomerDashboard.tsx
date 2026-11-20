import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  TrendingUp,
  Gift,
  Copy,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  Award,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { affiliateApi } from '../../api/affiliate'
import { ordersApi } from '../../api/orders'
import { TierBadge } from '../../components/tier/TierBadge'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const { data: dash, isLoading } = useQuery({
    queryKey: ['member-dashboard'],
    queryFn: affiliateApi.myDashboard,
    retry: false,
  })

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders-recent'],
    queryFn: () => ordersApi.myOrders(1),
    retry: false,
  })

  const referralCode = dash?.referralCode || user?.referralCode || ''
  const referralUrl = referralCode ? `${window.location.origin}/register/${referralCode}` : ''

  const handleCopy = () => {
    if (!referralUrl) return
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || ''}`.toUpperCase()
  const recentOrders = ordersData?.items?.slice(0, 4) ?? []

  return (
    <div className="space-y-7">
      {/* ── Welcome Header & Referral Link Box (Aameba origin/dev layout) ─── */}
      <div className="bg-gradient-to-r from-[#FFF4F1] via-[#FFFFFF] to-[#ECFEF9] p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-soft flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#FF5A36] via-[#FFB800] to-[#00C896] text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-coral-sm shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A36]">Welcome Back</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Hello, {user?.firstName || 'Member'}!
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              <TierBadge rank={dash?.memberRank || user?.memberRank} size="md" />
              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                ID: {dash?.memberCode || user?.memberCode || 'AG-MEMBER'}
              </span>
            </div>
          </div>
        </div>

        {referralUrl && (
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100 w-full xl:w-auto xl:min-w-[320px] shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              Your Referral Link
            </p>
            <div className="flex items-center justify-between gap-3 bg-orange-50/60 px-3.5 py-2.5 rounded-xl border border-orange-100">
              <span className="text-xs font-bold text-slate-700 truncate">{referralUrl}</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FF5A36] text-white text-xs font-extrabold hover:bg-[#E84420] transition shrink-0"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 3 Dopamine KPI Tiles (Exact Aameba origin/dev metrics) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border-2 border-cyan-100 p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Referrals</p>
            <p className="text-3xl font-black text-slate-900 mt-1.5">
              {isLoading ? '—' : dash?.totalReferrals ?? 0}
            </p>
            <Link to="/referral" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 mt-2 hover:underline">
              View My Circle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-mint-sm">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-amber-100 p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Lifetime Loyalty Points</p>
            <p className="text-3xl font-black text-slate-900 mt-1.5">
              {isLoading ? '—' : `${(dash?.lifetimePoints ?? 0).toFixed(2)} pts`}
            </p>
            <Link to="/wallet" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-2 hover:underline">
              Points History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFB800] to-[#FF8A00] text-white shadow-sun-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Available Loyalty Points</p>
            <p className="text-3xl font-black bg-gradient-to-r from-[#FF5A36] to-[#EC4899] bg-clip-text text-transparent mt-1.5">
              {isLoading ? '—' : `${(dash?.availablePoints ?? 0).toFixed(2)} pts`}
            </p>
            <Link to="/withdrawals" className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] mt-2 hover:underline">
              Redeem Rewards <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FF5A36] to-[#EC4899] text-white shadow-coral-sm">
            <Gift className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Interactive 4-Rung Rank Progress Tracker (Exact Aameba origin/dev) ─ */}
      {dash?.rankProgress && (
        <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A36] flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Ascend Tier Journey
              </p>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {dash.rankProgress.nextRankLabel
                  ? `Next Milestone: ${dash.rankProgress.nextRankLabel}`
                  : 'You Have Reached the Top Tier — Three Star!'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-[#FF5A36] bg-orange-50 px-3.5 py-2 rounded-full transition"
            >
              How to rank up
              <ChevronDown className={`w-4 h-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 4-Rung Visual Ladder */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dash.rankProgress.rungs.map((rung, idx) => (
              <div
                key={rung.code}
                className={`relative rounded-2xl p-4 border-2 transition-all ${
                  rung.current
                    ? 'border-[#FF5A36] bg-gradient-to-br from-orange-50 to-amber-50 shadow-coral-sm'
                    : rung.earned
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-slate-100 bg-slate-50/70 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tier {idx + 1}
                  </span>
                  {rung.current && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF5A36] text-white text-[9px] font-black uppercase">
                      You are here
                    </span>
                  )}
                </div>
                <TierBadge rank={rung.code} size="sm" />
              </div>
            ))}
          </div>

          {/* Live Requirement Bars (Dual bars for S1, single leg bar for S2/S3) */}
          {dash.rankProgress.requirements.length > 0 && (
            <div className="space-y-4 pt-2">
              {dash.rankProgress.requirements.map((req) => (
                <div key={req.metric} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{req.label}</span>
                    <span className="text-[#FF5A36] font-extrabold">
                      {req.kind === 'money'
                        ? `RM ${req.current.toLocaleString('en-MY', { minimumFractionDigits: 2 })} / RM ${req.target.toLocaleString('en-MY')}`
                        : `${req.current} / ${req.target}`}
                      {' '}({req.percent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-orange-100/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF5A36] via-[#FFB800] to-[#00C896] transition-all duration-700"
                      style={{ width: `${Math.max(req.percent, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {showGuide && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/70 p-4 text-xs text-slate-700 space-y-2">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFB800]" /> Tier Qualification Guide
              </p>
              <ul className="space-y-1 list-disc list-inside font-medium">
                <li><strong>Member (M):</strong> Unlocked automatically upon registration &amp; first purchase (15% Self &amp; L1/L2 Rebate).</li>
                <li><strong>One Star (S1):</strong> Invite 10 direct friends who purchase AND reach RM 8,000 combined direct downline spend (+15% Leadership Bonus).</li>
                <li><strong>Two Star (S2):</strong> Grow 5 direct legs that each have at least one One Star leader (+30% Leadership Bonus).</li>
                <li><strong>Three Star (S3):</strong> Grow 5 direct legs that each have at least one Two Star leader (+45% Top Leadership Bonus).</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Recent Orders ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500">Every order earns 15% Loyalty Points on its BV</p>
          </div>
          <Link to="/orders" className="text-xs font-extrabold text-[#FF5A36] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 bg-orange-50/40 rounded-2xl border border-dashed border-orange-200">
            <ShoppingBag className="w-10 h-10 text-orange-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No orders yet</p>
            <Link to="/shop" className="btn-primary mt-4 !py-2 !px-5 !text-xs">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}/receipt`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-orange-100 hover:border-[#FF5A36] hover:bg-orange-50/30 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-[#FF5A36] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {order.items?.reduce((s, i) => s + i.quantity, 0) || 1}x
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{order.orderNo}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {order.status}
                  </span>
                  <span className="font-black text-slate-900 text-sm">
                    RM {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
