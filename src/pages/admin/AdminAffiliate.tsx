import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { affiliateApi } from '../../api/affiliate'
import { usersApi } from '../../api/users'
import { MLMNetworkTree } from '../../components/ui/MLMNetworkTree'
import { useState, useEffect } from 'react'
import {
  CheckCircle, Loader2, Settings2, DollarSign,
  Search, Network, BarChart3, TrendingUp, Award, Activity,
  ChevronRight,
} from 'lucide-react'
import type { MLMTreeNode, User } from '../../types'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const card = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
} as const
const th = 'pb-3 pr-4 text-left text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap'
const td = 'py-3 pr-4 text-sm align-top'

const LEVEL_COLORS: Record<number, string> = { 1: '#D4AF37', 2: '#60a5fa', 3: '#a78bfa', 4: '#6B7280' }
const levelColor = (l: number) => LEVEL_COLORS[l] ?? '#4B5563'

function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'paid'     ? { bg: 'rgba(34,197,94,0.1)',  color: '#4ade80', border: 'rgba(34,197,94,0.2)' } :
    status === 'approved' ? { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' } :
                            { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' }
  return (
    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {status}
    </span>
  )
}

// ── MLM Settings panel ────────────────────────────────────────────────────────
function MLMSettingsPanel() {
  const qc = useQueryClient()
  const { data: settings } = useQuery({
    queryKey: ['admin', 'affiliate', 'settings'],
    queryFn: affiliateApi.getSettings,
  })

  const [rates, setRates] = useState<number[]>([5, 3, 1])
  const [depth, setDepth] = useState(3)
  const [minPayout, setMinPayout] = useState(50)
  const [isActive, setIsActive] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!settings) return
    setDepth(settings.mlmDepth ?? 3)
    setMinPayout(settings.minPayoutAmt ?? 50)
    setIsActive(settings.isActive)
    try {
      const parsed = JSON.parse(settings.mlmLevelRates)
      if (Array.isArray(parsed)) setRates(parsed)
    } catch { /* keep defaults */ }
  }, [settings])

  const updateSettings = useMutation({
    mutationFn: () => affiliateApi.updateSettings({
      mlmLevelRates: rates.slice(0, depth),
      mlmDepth: depth,
      minPayoutAmt: minPayout,
      isActive,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'affiliate', 'settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  return (
    <div className="p-5" style={card}>
      <div className="flex items-center gap-2 mb-5">
        <Settings2 className="h-4 w-4" style={{ color: GOLD }} />
        <p className="text-sm font-bold text-white">MLM Commission Configuration</p>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
          style={{ background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: isActive ? '#4ade80' : '#6b7280' }}>
          {isActive ? 'Program Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
            MLM Depth (Levels)
          </label>
          <input className="dark-input" type="number" min={1} max={10} value={depth}
            onChange={e => {
              const d = Math.max(1, Math.min(10, Number(e.target.value)))
              setDepth(d)
              setRates(prev => {
                const next = [...prev]
                while (next.length < d) next.push(0)
                return next.slice(0, d)
              })
            }} />
          <p className="text-[10px] text-gray-700 mt-1">Commission paid for {depth} level{depth !== 1 ? 's' : ''} down</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
            Min. Payout Threshold (RM)
          </label>
          <input className="dark-input" type="number" min={0} value={minPayout}
            onChange={e => setMinPayout(Number(e.target.value))} />
        </div>

        {/* Per-level rates */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
            Commission % per Level
          </label>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: depth }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <label className="block text-[10px] font-semibold mb-1.5" style={{ color: levelColor(i + 1) }}>
                  Level {i + 1}
                </label>
                <div className="relative">
                  <input className="dark-input w-20 text-center pr-7" type="number" min={0} max={50} step={0.5}
                    value={rates[i] ?? 0}
                    onChange={e => {
                      const next = [...rates]
                      next[i] = Number(e.target.value)
                      setRates(next)
                    }} />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
          {/* Visual preview bar */}
          <div className="mt-4 flex items-end gap-1 h-12">
            {rates.slice(0, depth).map((r, i) => {
              const max = Math.max(...rates.slice(0, depth), 1)
              const h = (r / max) * 100
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[48px]">
                  <div className="rounded-t-sm w-full" style={{ height: `${h}%`, background: levelColor(i + 1), minHeight: 2 }} />
                  <span className="text-[10px] text-gray-600 font-mono">{r}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active toggle */}
        <div className="sm:col-span-2">
          <button onClick={() => setIsActive(v => !v)} className="flex items-center gap-3">
            <div className="w-10 h-5 rounded-full transition-all relative cursor-pointer"
              style={{ background: isActive ? GOLD : 'rgba(255,255,255,0.1)' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: isActive ? '1.25rem' : '0.125rem' }} />
            </div>
            <span className="text-sm font-semibold text-white">Consultant MLM Program {isActive ? 'Active' : 'Paused'}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 pt-5 border-t border-gray-900">
        <button disabled={updateSettings.isPending} onClick={() => updateSettings.mutate()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          {updateSettings.isPending ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <p className="text-sm text-green-400 font-semibold animate-in fade-in">✓ Saved!</p>}
      </div>
    </div>
  )
}

// ── Admin Network Browser ─────────────────────────────────────────────────────
function AdminNetworkBrowser() {
  const [search, setSearch] = useState('')
  const [tree, setTree] = useState<MLMTreeNode | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Search members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['admin', 'users', 'for-network', search],
    queryFn: () => usersApi.list({ search, pageSize: 8 }),
    enabled: search.length > 1,
  })

  async function loadTree(userId: string) {
    setLoading(true)
    setError('')
    setTree(null)
    try {
      const result = await affiliateApi.adminNetworkTree(userId)
      setTree(result)
    } catch {
      setError('Could not load network tree for this member.')
    } finally {
      setLoading(false)
    }
  }

  function selectMember(user: User) {
    setSelectedUser(user)
    setSearch('')
    loadTree(user.id)
  }

  return (
    <div className="p-5 space-y-5" style={card}>
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4" style={{ color: GOLD }} />
        <p className="text-sm font-bold text-white">MLM Network Browser</p>
      </div>
      <p className="text-xs text-gray-600">Search any member by name or email to visualize their full downline network.</p>

      {/* Search input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
        <input className="dark-input w-full" style={{ paddingLeft: 40 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setTree(null); setSelectedUser(null) }} />
      </div>

      {/* Member search results */}
      {search.length > 1 && (
        <div className="rounded-xl overflow-hidden border border-gray-800 max-w-md" style={{ background: '#0d0d0d' }}>
          {membersLoading && (
            <div className="px-4 py-3 flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {!membersLoading && !members?.items?.length && (
            <div className="px-4 py-3 text-sm text-gray-600">No members found</div>
          )}
          {members?.items?.map(user => (
            <button key={user.id} onClick={() => selectMember(user)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors border-b border-gray-900 last:border-0">
              <div>
                <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.referralCode && <span className="text-[10px] font-mono" style={{ color: GOLD }}>{user.referralCode}</span>}
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Currently selected member */}
      {selectedUser && !search && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-md"
          style={{ background: 'rgba(233,30,140,0.05)', border: '1px solid rgba(233,30,140,0.18)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            {(selectedUser.firstName?.[0] ?? '') + (selectedUser.lastName?.[0] ?? '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: GOLD }}>{selectedUser.referralCode}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-600 py-4">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading network…
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {tree && (
        <div className="border-t border-gray-900 pt-5">
          <MLMNetworkTree root={tree} showAnalytics />
        </div>
      )}
    </div>
  )
}

// ── Commission Stats ──────────────────────────────────────────────────────────
function CommissionKPIs() {
  const { data: all } = useQuery({
    queryKey: ['admin', 'affiliate', 'commissions', '', 1],
    queryFn: () => affiliateApi.listCommissions({ page: 1 }),
  })
  const { data: pending } = useQuery({
    queryKey: ['admin', 'affiliate', 'commissions', 'pending', 1],
    queryFn: () => affiliateApi.listCommissions({ status: 'pending', page: 1 }),
  })
  const { data: paid } = useQuery({
    queryKey: ['admin', 'affiliate', 'commissions', 'paid', 1],
    queryFn: () => affiliateApi.listCommissions({ status: 'paid', page: 1 }),
  })

  const kpis = [
    { label: 'Total Commissions', value: all?.total ?? '—', icon: Activity, color: GOLD },
    { label: 'Pending Approval', value: pending?.total ?? '—', icon: TrendingUp, color: '#fbbf24' },
    { label: 'Paid Out', value: paid?.total ?? '—', icon: Award, color: '#4ade80' },
    { label: 'Pending Amount', value: pending?.total ? `~RM ${(pending.items?.reduce((a, c) => a + c.commissionAmt, 0) ?? 0).toFixed(2)}` : '—', icon: DollarSign, color: '#a78bfa' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-2xl p-4" style={card}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</span>
            <Icon className="h-3.5 w-3.5" style={{ color }} />
          </div>
          <p className="text-xl font-black text-white">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminAffiliate() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [commPage, setCommPage] = useState(1)

  const { data: commissions, isLoading, isError } = useQuery({
    queryKey: ['admin', 'affiliate', 'commissions', statusFilter, commPage],
    queryFn: () => affiliateApi.listCommissions({ status: statusFilter || undefined, page: commPage }),
  })

  const approve = useMutation({
    mutationFn: (id: string) => affiliateApi.approveCommission(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'affiliate', 'commissions'] }),
  })
  const markPaid = useMutation({
    mutationFn: (id: string) => affiliateApi.markPaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'affiliate', 'commissions'] }),
  })

  const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" style={{ color: GOLD }} />
        <div>
          <h1 className="text-2xl font-black text-white">Consultant / MLM</h1>
          <p className="text-xs text-gray-600 mt-0.5">Multi-level commission management & network analytics</p>
        </div>
      </div>

      {/* Commission KPIs */}
      <CommissionKPIs />

      {/* MLM Settings */}
      <MLMSettingsPanel />

      {/* Network Browser */}
      <AdminNetworkBrowser />

      {/* Commissions table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="px-5 py-4 border-b border-gray-900 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-white">Commission Ledger</p>
          {/* Status filter tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STATUS_TABS.map(tab => (
              <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setCommPage(1) }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={statusFilter === tab.value
                  ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
                  : { color: '#6b7280' }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        )}
        {isError && <div className="py-10 text-center text-red-400 text-sm">Failed to load commissions.</div>}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th + " pl-5"}>Order</th>
                  <th className={th}>Referrer</th>
                  <th className={th}>Purchaser</th>
                  <th className={th}>Level</th>
                  <th className={th}>Sale Amt</th>
                  <th className={th}>Commission</th>
                  <th className={th}>Status</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!commissions?.items?.length && (
                  <tr><td colSpan={8} className="py-10 text-center text-gray-700">No commissions yet</td></tr>
                )}
                {commissions?.items?.map(c => (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.015] transition-colors">
                    <td className={td + ' pl-5 font-mono text-xs text-gray-500'}>{c.orderNo}</td>
                    <td className={td + ' text-gray-300'}>
                      {c.referrer ? `${c.referrer.firstName} ${c.referrer.lastName}` : c.referrerId.slice(0, 8)}
                    </td>
                    <td className={td + ' text-gray-400'}>
                      {c.referee ? `${c.referee.firstName} ${c.referee.lastName}` : c.refereeId?.slice(0, 8)}
                    </td>
                    <td className={td}>
                      <span className="text-xs font-black px-2 py-0.5 rounded"
                        style={{ background: `${levelColor(c.level)}18`, color: levelColor(c.level) }}>
                        L{c.level}
                      </span>
                    </td>
                    <td className={td + ' text-gray-400 whitespace-nowrap'}>RM {c.saleAmount?.toFixed(2)}</td>
                    <td className={td + ' font-black whitespace-nowrap'} style={{ color: GOLD }}>
                      RM {c.commissionAmt?.toFixed(2)}
                      <span className="text-gray-600 font-normal text-[10px] ml-1">({c.commissionRate}%)</span>
                    </td>
                    <td className={td}><StatusBadge status={c.status} /></td>
                    <td className={td}>
                      <div className="flex gap-1.5 flex-wrap">
                        {c.status === 'pending' && (
                          <button onClick={() => approve.mutate(c.id)}
                            className="flex items-center gap-1 text-xs font-bold text-black px-2.5 py-1 rounded-lg"
                            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                        )}
                        {c.status === 'approved' && (
                          <button onClick={() => markPaid.mutate(c.id)}
                            className="flex items-center gap-1 text-xs font-bold text-black px-2.5 py-1 rounded-lg"
                            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                            <CheckCircle className="h-3 w-3" /> Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(commissions?.total ?? 0) > 20 && (
          <div className="px-5 py-4 border-t border-gray-900 flex items-center justify-between">
            <span className="text-xs text-gray-600">Total: <strong className="text-white">{commissions?.total}</strong> commissions</span>
            <div className="flex gap-2">
              <button disabled={commPage <= 1} onClick={() => setCommPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>← Prev</button>
              <button disabled={(commPage * 20) >= (commissions?.total ?? 0)} onClick={() => setCommPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
