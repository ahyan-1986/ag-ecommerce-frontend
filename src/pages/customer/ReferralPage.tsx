import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { affiliateApi } from '../../api/affiliate'
import { useAuth } from '../../contexts/AuthContext'
import { MLMNetworkTree } from '../../components/ui/MLMNetworkTree'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy, Check, Users, TrendingUp, DollarSign, Award,
  UserCheck, ExternalLink, Share2, ChevronDown, ChevronUp,
  Layers, Loader2, Clock
} from 'lucide-react'
import type { AffiliateCommission } from '../../types'

const OLIVE = '#2F4C2C'
const GOLD  = '#C5963B'

const LEVEL_COLORS: Record<number, string> = {
  1: '#C5963B',
  2: '#2F4C2C',
  3: '#4E7749',
}

function levelColor(l: number) {
  return LEVEL_COLORS[l] ?? '#4B5563'
}

function fmt(v?: number) {
  return (v ?? 0).toFixed(2)
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color = GOLD,
}: {
  label: string; value: React.ReactNode; sub?: string
  icon: React.ElementType; color?: string
}) {
  return (
    <div className="rounded-3xl p-5 flex flex-col justify-between bg-white border border-emerald-900/10 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-800">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{value}</div>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label = 'Salin' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function doCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={doCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 cursor-pointer">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Disalin!' : label}
    </button>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-emerald-800" />
      <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-950">{children}</h3>
    </div>
  )
}

// ── Commission status badge ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'paid'     ? { bg: 'bg-emerald-50',  color: 'text-emerald-700', border: 'border-emerald-200', label: 'Dibayar'   } :
    status === 'approved' ? { bg: 'bg-blue-50',     color: 'text-blue-700',    border: 'border-blue-200',    label: 'Diluluskan'} :
    status === 'pending'  ? { bg: 'bg-amber-50',    color: 'text-amber-700',   border: 'border-amber-200',   label: 'Menunggu'  } :
                            { bg: 'bg-rose-50',     color: 'text-rose-700',    border: 'border-rose-200',    label: 'Ditolak'   }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

export default function ReferralPage() {
  const { user } = useAuth()
  const [showTree, setShowTree] = useState(true)
  const [commPage, setCommPage] = useState(1)

  const { data: networkStats, isLoading: statsLoading } = useQuery({
    queryKey: ['affiliate-network-stats'],
    queryFn: affiliateApi.myNetworkStats,
  })

  const { data: sponsor } = useQuery({
    queryKey: ['affiliate-sponsor'],
    queryFn: affiliateApi.mySponsor,
  })

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ['affiliate-tree'],
    queryFn: affiliateApi.myNetworkTree,
    enabled: showTree,
  })

  const { data: commData, isLoading: commLoading } = useQuery({
    queryKey: ['affiliate-commissions', commPage],
    queryFn: () => affiliateApi.myCommissions({ page: commPage, pageSize: 8 }),
  })

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode ?? ''}`
  const levelRates = networkStats?.levelRates ?? [5, 3, 1]

  function share() {
    if (navigator.share) {
      navigator.share({
        title: 'Sertai Komuniti Makanan Kesihatan Asian Mum',
        text: `Sertai saya dan nikmati diskaun sehingga 35% serta ganjaran usahawan! Gunakan kod rujukan saya: ${user?.referralCode}`,
        url: referralLink,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(referralLink)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 border border-emerald-300 text-emerald-900 shadow-xs">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Rangkaian Usahawan Saya</h1>
            <p className="text-xs text-gray-500 mt-0.5">Program rakan kongsi & affiliate Asian Mum — raih komisen 3 peringkat</p>
          </div>
        </div>

        <button
          onClick={share}
          className="btn-primary py-2.5 px-5 text-xs font-bold shadow-sm inline-flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" /> Kongsi Pautan Rujukan
        </button>
      </div>

      {/* ── Stats row ── */}
      {statsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-3xl bg-white border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Jumlah Rangkaian"
            value={networkStats?.totalDownline ?? 0}
            sub={`${networkStats?.directReferrals ?? 0} tajaan langsung`}
            icon={Users}
            color={OLIVE}
          />
          <StatCard
            label="Jumlah Komisen"
            value={`RM ${fmt(networkStats?.totalEarned)}`}
            sub={`RM ${fmt(networkStats?.pendingEarned)} sedang diproses`}
            icon={DollarSign}
            color={GOLD}
          />
          <StatCard
            label="Langsung (Level 1)"
            value={networkStats?.directReferrals ?? 0}
            sub={`${levelRates[0] ?? 5}% komisen`}
            icon={Award}
            color={OLIVE}
          />
          <StatCard
            label="Generasi 2 & 3"
            value={(networkStats?.totalDownline ?? 0) - (networkStats?.directReferrals ?? 0)}
            sub="Rangkaian berbilang tingkat"
            icon={TrendingUp}
            color={GOLD}
          />
        </div>
      )}

      {/* ── Commission Structure Info ── */}
      {levelRates.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
          <SectionHeader icon={TrendingUp}>Struktur Komisen Rangkaian</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {levelRates.map((rate: number, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-900/10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: levelColor(idx + 1) }} />
                  <span className="text-xs font-bold text-gray-800">Peringkat {idx + 1} (Level {idx + 1})</span>
                </div>
                <span className="text-base font-black text-emerald-900">{rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Two column: Sponsor + Referral link ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Sponsor card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
          <SectionHeader icon={UserCheck}>Penaja Saya (My Sponsor)</SectionHeader>
          {sponsor?.hasSponsor ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-900 font-black text-base border border-emerald-300 shrink-0">
                {sponsor.firstName?.[0]}{sponsor.lastName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-gray-900 truncate">{sponsor.firstName} {sponsor.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{sponsor.email}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Kod Penaja: <span className="font-mono font-bold text-emerald-900">{sponsor.referralCode}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-900">Anda mendaftar tanpa penaja.</p>
              <p className="text-xs text-emerald-800 mt-1">Status: Ahli Pengasas (Founding Partner) 🌟</p>
            </div>
          )}
        </div>

        {/* Referral link + QR */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
          <SectionHeader icon={Share2}>Pautan & Kod Rujukan Anda</SectionHeader>
          <div className="flex gap-4 items-center">
            <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs shrink-0">
              <QRCodeSVG value={referralLink} size={80} bgColor="#fff" fgColor={OLIVE} level="M" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-mono text-gray-700 truncate">
                {referralLink}
              </div>
              <div className="flex gap-2 flex-wrap">
                <CopyBtn text={referralLink} label="Salin Pautan" />
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Kongsi
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <span className="text-gray-500">Kod Rujukan Anda:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-emerald-900">{user?.referralCode}</span>
              <CopyBtn text={user?.referralCode ?? ''} label="Salin Kod" />
            </div>
          </div>
        </div>

      </div>

      {/* ── Sponsor Tree ── */}
      <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowTree((v) => !v)}
          className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-emerald-800" />
            <span className="text-sm font-bold text-gray-900">Salasilah Downline Rangkaian (Tree View)</span>
            {networkStats && networkStats.totalDownline > 0 && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full text-white bg-emerald-800">
                {networkStats.totalDownline} Ahli
              </span>
            )}
          </div>
          {showTree ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </button>

        {showTree && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            {treeLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-500 text-xs">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
                <span>Memuatkan salasilah rangkaian...</span>
              </div>
            ) : treeData ? (
              <MLMNetworkTree root={treeData} />
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs">
                Tiada data downline ditemui. Kongsi pautan rujukan anda untuk mula membina rangkaian!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Commission History Table ── */}
      <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader icon={Clock}>Sejarah Rekod Komisen</SectionHeader>
          {commData?.total != null && (
            <span className="text-xs text-gray-500">{commData.total} rekod</span>
          )}
        </div>

        {commLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-500 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
            <span>Memuatkan rekod komisen...</span>
          </div>
        ) : (commData?.items ?? []).length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-gray-100">
            Tiada transaksi komisen lagi. Sebarang pembelian oleh downline anda akan dipaparkan di sini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Tarikh</th>
                  <th className="py-3 px-3">Peringkat</th>
                  <th className="py-3 px-3">Pesanan</th>
                  <th className="py-3 px-3">Jumlah Jualan</th>
                  <th className="py-3 px-3">Komisen</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {commData?.items.map((comm: AffiliateCommission) => (
                  <tr key={comm.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3">{formatDate(comm.createdAt)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-900">Level {comm.level}</td>
                    <td className="py-3 px-3 font-mono text-gray-500">{comm.orderNo || `#${comm.orderId?.slice(0, 8)}`}</td>
                    <td className="py-3 px-3 font-bold">RM {fmt(comm.saleAmount)}</td>
                    <td className="py-3 px-3 font-black text-emerald-900">RM {fmt(comm.commissionAmt)}</td>
                    <td className="py-3 px-3"><StatusBadge status={comm.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {(commData?.totalPages ?? 1) > 1 && (
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setCommPage(p => Math.max(1, p - 1))}
                  disabled={commPage <= 1}
                  className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <span className="text-xs py-1 px-2 text-gray-500">Muka {commPage} / {commData?.totalPages}</span>
                <button
                  onClick={() => setCommPage(p => Math.min(commData?.totalPages ?? 1, p + 1))}
                  disabled={commPage >= (commData?.totalPages ?? 1)}
                  className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Seterusnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
