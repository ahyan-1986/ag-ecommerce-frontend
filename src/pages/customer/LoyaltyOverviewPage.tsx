import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Copy, CheckCircle2, Share2, Users, TrendingUp, Gift, ArrowRight, Activity } from 'lucide-react'
import { affiliateApi } from '../../api/affiliate'
import { walletApi } from '../../api/wallet'

export default function LoyaltyOverviewPage() {
  const [copied, setCopied] = useState(false)

  const { data: dash } = useQuery({
    queryKey: ['member-dashboard'],
    queryFn: affiliateApi.myDashboard,
  })
  const { data: netStats } = useQuery({
    queryKey: ['mlm-network-stats'],
    queryFn: affiliateApi.myNetworkStats,
  })
  const { data: txData } = useQuery({
    queryKey: ['wallet-tx-preview'],
    queryFn: () => walletApi.getMyTransactions({ page: 1, pageSize: 6 }),
  })

  const referralUrl = dash?.referralCode ? `${window.location.origin}/register/${dash.referralCode}` : ''

  const handleCopy = () => {
    if (!referralUrl) return
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share && referralUrl) {
      try {
        await navigator.share({ title: 'Join my Ascend Group Circle!', url: referralUrl })
        return
      } catch {
        // fallback to copy
      }
    }
    handleCopy()
  }

  const recentTxs = txData?.items ?? []

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#00A37B]">Loyalty &amp; Rewards</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Loyalty Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your referral link, track downline conversions, and watch your Loyalty Points grow.
        </p>
      </div>

      {/* Referral Link + Loyalty Points Balance Row (Exact Aameba origin/dev) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-7 shadow-soft flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF5A36] to-[#FFB800] text-white flex items-center justify-center shadow-coral-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Share Your Ascend Circle Link</h2>
              <p className="text-xs text-slate-500">Earn 15% Rebate on L1 &amp; L2 orders + Leadership Bonus up to 45%</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex-1 bg-orange-50/70 border border-orange-200/80 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 truncate">
              {referralUrl || 'Loading your referral link...'}
            </div>
            <button onClick={handleCopy} className="btn-primary !py-3 !px-5 !text-xs shrink-0">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={handleShare} className="btn-outline !py-3 !px-4 !text-xs shrink-0">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FFF4F1] via-[#FFFBEB] to-[#ECFEF9] rounded-3xl border-2 border-amber-200/80 p-6 shadow-soft flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#FF5A36]" /> Loyalty Point Balance
            </p>
            <p className="text-4xl font-black text-slate-900 mt-2">
              {(dash?.availablePoints ?? 0).toFixed(2)}
              <span className="text-base font-bold text-slate-400 ml-1">pts</span>
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">1 Point = RM 1.00 at Checkout or Cash Out</p>
          </div>
          <Link to="/withdrawals" className="btn-mint !py-2.5 !text-xs mt-4 w-full">
            Redeem Rewards <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Two Tiles: Successful Signups & Total Conversions (Exact Aameba origin/dev) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border-2 border-emerald-100 p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Successful Signups</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{netStats?.directReferrals ?? dash?.totalReferrals ?? 0}</p>
            <Link to="/referral" className="inline-flex items-center gap-1 text-xs font-bold text-[#00A37B] mt-2 hover:underline">
              Explore My Ascend Circle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-[#00C896]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-cyan-100 p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Conversions</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{netStats?.totalConversions ?? 0}</p>
            <p className="text-xs font-semibold text-slate-400 mt-2">Paid orders across direct downline</p>
          </div>
          <div className="p-4 rounded-2xl bg-cyan-50 text-cyan-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Loyalty Points Activities Preview */}
      <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-7 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF5A36]" />
            Recent Loyalty Points Activities
          </h2>
          <Link to="/wallet" className="text-xs font-extrabold text-[#FF5A36] hover:underline flex items-center gap-1">
            View Full History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTxs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No loyalty point movements yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-orange-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Order / Ref No.</th>
                  <th className="py-3 pr-4">Activity</th>
                  <th className="py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {recentTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-orange-50/30">
                    <td className="py-3.5 pr-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-MY')}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-xs font-bold text-slate-700">
                      {tx.orderNo || tx.refId || '—'}
                    </td>
                    <td className="py-3.5 pr-4 text-xs font-semibold text-slate-700">{tx.description}</td>
                    <td
                      className={`py-3.5 text-right font-black text-sm whitespace-nowrap ${
                        tx.amount >= 0 ? 'text-[#00A37B]' : 'text-rose-500'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
