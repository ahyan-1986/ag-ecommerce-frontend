import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, type CRMSummary } from '../../api/users'
import { affiliateApi } from '../../api/affiliate'
import type { User, MLMTreeNode } from '../../types'
import { MLMNetworkTree } from '../../components/ui/MLMNetworkTree'
import {
  Search, Users, UserCheck, UserX, ToggleLeft, ToggleRight,
  Loader2, TrendingUp, ShoppingBag, DollarSign, Star, Activity,
  ChevronRight, X, Mail, Phone, MapPin, Calendar, Tag,
  Award, Gift, Network, BarChart3, Eye, Shield, Clock,
} from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 } as const
const th = 'pb-3 pr-4 text-left text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap'
const td = 'py-3.5 pr-4 text-sm align-middle'

function initials(u: User) { return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?' }
function fullName(u: User) { return `${u.firstName} ${u.lastName}`.trim() }
function fmtDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── KPI Strip ─────────────────────────────────────────────────────────────────
function CRMKPIs({ summary }: { summary?: CRMSummary }) {
  const kpis = [
    { label: 'Total Customers', value: summary?.totalCustomers ?? '—', icon: Users, color: GOLD },
    { label: 'Active', value: summary?.activeCustomers ?? '—', icon: UserCheck, color: '#4ade80' },
    { label: 'New This Month', value: summary?.newThisMonth ?? '—', icon: TrendingUp, color: '#60a5fa' },
    { label: 'Total Revenue', value: summary ? `RM ${summary.totalRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—', icon: DollarSign, color: '#a78bfa' },
    { label: 'Avg Order Value', value: summary ? `RM ${summary.avgOrderValue.toFixed(2)}` : '—', icon: ShoppingBag, color: '#34d399' },
    { label: 'With Referral', value: summary?.withReferralCode ?? '—', icon: Gift, color: '#fb923c' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-2xl p-4" style={card}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 leading-tight">{label}</span>
            <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
          </div>
          <p className="text-xl font-black text-white truncate">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Customer 360 Drawer ───────────────────────────────────────────────────────
function CustomerDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'network'>('overview')
  const qc = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'crm', 'stats', user.id],
    queryFn: () => usersApi.getUserCRMStats(user.id),
  })

  const [tree, setTree] = useState<MLMTreeNode | null>(null)
  const [treeLoading, setTreeLoading] = useState(false)
  const [treeError, setTreeError] = useState('')

  async function loadTree() {
    setTreeLoading(true)
    setTreeError('')
    try {
      const result = await affiliateApi.adminNetworkTree(user.id)
      setTree(result)
    } catch {
      setTreeError('No network data found for this member.')
    } finally {
      setTreeLoading(false)
    }
  }

  const toggleActive = useMutation({
    mutationFn: () => usersApi.setActive(user.id, !user.isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const approveDealer = useMutation({
    mutationFn: () => usersApi.approveDealer(user.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const TABS = [
    { key: 'overview' as const, label: 'Profile & Stats', icon: <Eye className="h-3.5 w-3.5" /> },
    { key: 'network' as const, label: 'MLM Network', icon: <Network className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
      <div className="w-full max-w-xl h-full flex flex-col overflow-hidden"
        style={{ background: '#0e0e0e', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-900 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            {initials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white truncate">{fullName(user)}</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                style={{ background: user.role === 'dealer' ? 'rgba(168,85,247,0.15)' : 'rgba(233,30,140,0.08)', color: user.role === 'dealer' ? '#a855f7' : GOLD }}>
                {user.role}
              </span>
              {user.dealerApproved && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                  Approved
                </span>
              )}
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                style={{
                  background: user.isActive ? 'rgba(34,197,94,0.08)' : 'rgba(107,114,128,0.1)',
                  color: user.isActive ? '#4ade80' : '#6b7280',
                }}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-6 py-3 border-b border-gray-900 flex items-center gap-2 flex-wrap flex-shrink-0">
          <button onClick={() => toggleActive.mutate()}
            disabled={toggleActive.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={user.isActive
              ? { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
              : { background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
            {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
          {user.role === 'dealer' && !user.dealerApproved && (
            <button onClick={() => approveDealer.mutate()}
              disabled={approveDealer.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
              style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
              <Shield className="h-3.5 w-3.5" /> Approve Consultant
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="px-6 py-3 border-b border-gray-900 flex gap-1 flex-shrink-0">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={activeTab === t.key
                ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
                : { color: '#6b7280' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* CRM Stats */}
              {statsLoading ? (
                <div className="flex justify-center py-6 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : stats && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#60a5fa' },
                    { label: 'Lifetime Spend', value: `RM ${stats.totalSpend.toFixed(2)}`, icon: DollarSign, color: GOLD },
                    { label: 'Direct Downline', value: stats.downlineCount, icon: Users, color: '#4ade80' },
                    { label: 'Commission Earned', value: `RM ${stats.commissionEarned.toFixed(2)}`, icon: Award, color: '#a78bfa' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl p-4" style={{ ...card, padding: 16 }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</span>
                        <Icon className="h-3.5 w-3.5" style={{ color }} />
                      </div>
                      <p className="text-xl font-black text-white">{value}</p>
                      {label === 'Total Orders' && stats.lastOrderAt && (
                        <p className="text-[10px] text-gray-600 mt-1">Last: {fmtDate(stats.lastOrderAt)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Contact details */}
              <div className="rounded-xl p-4 space-y-3" style={card}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Contact Information</p>
                {[
                  { icon: Mail, value: user.email },
                  { icon: Phone, value: user.phone || '—' },
                  { icon: Calendar, value: `Joined ${fmtDate(user.createdAt)}` },
                  { icon: Clock, value: user.dateOfBirth ? `DOB: ${fmtDate(user.dateOfBirth)}` : user.gender ? `Gender: ${user.gender}` : null },
                  {
                    icon: MapPin,
                    value: [user.addressLine1, user.city, user.state, user.postcode, user.country]
                      .filter(Boolean).join(', ') || '—'
                  },
                ].filter(r => r.value).map(({ icon: Icon, value }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-600" />
                    <span className="text-xs text-gray-400 break-words">{value}</span>
                  </div>
                ))}
              </div>

              {/* Referral / MLM info */}
              <div className="rounded-xl p-4 space-y-3" style={card}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">MLM / Referral</p>
                <div className="flex items-center gap-3">
                  <Tag className="h-3.5 w-3.5 text-gray-600" />
                  <div>
                    <p className="text-[10px] text-gray-600">My Referral Code</p>
                    <p className="text-sm font-mono font-black" style={{ color: GOLD }}>{user.referralCode || '—'}</p>
                  </div>
                </div>
                {user.referredByCode && (
                  <div className="flex items-center gap-3">
                    <Star className="h-3.5 w-3.5 text-gray-600" />
                    <div>
                      <p className="text-[10px] text-gray-600">Referred By Code</p>
                      <p className="text-sm font-mono font-semibold text-gray-300">{user.referredByCode}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification badges */}
              <div className="rounded-xl p-4" style={card}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-3">Verification</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: 'Email', verified: user.emailVerified },
                    { label: 'Active Account', verified: user.isActive },
                    { label: 'Consultant Approved', verified: !!user.dealerApproved, show: user.role === 'dealer' },
                  ].filter(b => b.show !== false).map(({ label, verified }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: verified ? '#4ade80' : '#6b7280' }}>
                      {verified ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">View this member's full MLM downline tree.</p>
              {!tree && !treeLoading && (
                <button onClick={loadTree}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black"
                  style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                  <Network className="h-4 w-4" /> Load Network Tree
                </button>
              )}
              {treeLoading && <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading tree…</div>}
              {treeError && <p className="text-sm text-red-400">{treeError}</p>}
              {tree && <MLMNetworkTree root={tree} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main CRM Page ──────────────────────────────────────────────────────────────
type RoleFilter = '' | 'customer' | 'dealer'

export default function AdminCustomers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: summary } = useQuery({
    queryKey: ['admin', 'crm', 'summary'],
    queryFn: () => usersApi.getCRMSummary(),
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', roleFilter, search, page],
    queryFn: () => usersApi.list({ role: roleFilter || undefined, search, page, pageSize: 20 }),
  })

  const ROLE_TABS: { value: RoleFilter; label: string; icon: React.ReactNode }[] = [
    { value: '', label: 'All Members', icon: <Users className="h-3.5 w-3.5" /> },
    { value: 'customer', label: 'Customers', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    { value: 'dealer', label: 'Consultants', icon: <Star className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">CRM</h1>
          <p className="text-xs text-gray-600 mt-0.5">Customer Relationship Management — 360° member view</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Activity className="h-4 w-4" style={{ color: GOLD }} />
          <span>Live data</span>
        </div>
      </div>

      {/* KPI strip */}
      <CRMKPIs summary={summary} />

      {/* Table card */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-900 flex flex-wrap items-center gap-3">
          {/* Role tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {ROLE_TABS.map(t => (
              <button key={t.value} onClick={() => { setRoleFilter(t.value); setPage(1) }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={roleFilter === t.value
                  ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
                  : { color: '#6b7280' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input className="dark-input w-full" style={{ paddingLeft: 40 }}
              placeholder="Search name, email, phone..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>

        {isLoading && <div className="flex items-center justify-center py-20 gap-3 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading members...</div>}
        {isError && <div className="py-10 text-center text-red-400 text-sm p-5">Failed to load members.</div>}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th + " pl-5"}>Member</th>
                  <th className={th}>Role</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Referral Code</th>
                  <th className={th}>Status</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!data?.items?.length) && (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-700 text-sm">
                    No members found
                  </td></tr>
                )}
                {data?.items?.map(user => (
                  <tr key={user.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.015] transition-colors">
                    <td className={td + " pl-5"}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-black flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                          {initials(user)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{fullName(user)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                        style={{
                          background: user.role === 'dealer' ? 'rgba(168,85,247,0.1)' : 'rgba(233,30,140,0.07)',
                          color: user.role === 'dealer' ? '#a855f7' : GOLD,
                        }}>
                        {user.role}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="text-xs text-gray-400">{user.phone || '—'}</div>
                      {user.city && <div className="text-[10px] text-gray-600">{user.city}{user.state ? `, ${user.state}` : ''}</div>}
                    </td>
                    <td className={td}>
                      {user.referralCode ? (
                        <span className="font-mono text-xs font-bold" style={{ color: GOLD }}>{user.referralCode}</span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    <td className={td}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg w-fit"
                          style={{
                            background: user.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                            color: user.isActive ? '#4ade80' : '#6b7280',
                          }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!user.emailVerified && (
                          <span className="text-[10px] text-yellow-600">Unverified</span>
                        )}
                      </div>
                    </td>
                    <td className={td + " text-xs text-gray-500"}>{fmtDate(user.createdAt)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(233,30,140,0.07)', color: GOLD, border: '1px solid rgba(233,30,140,0.18)' }}>
                          <BarChart3 className="h-3 w-3" /> 360°
                        </button>
                        <button
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          onClick={async () => {
                            await usersApi.setActive(user.id, !user.isActive)
                          }}
                          className="text-gray-500 hover:text-white transition-colors">
                          {user.isActive
                            ? <ToggleRight className="h-5 w-5 text-green-400" />
                            : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button onClick={() => setSelectedUser(user)}
                          className="text-gray-600 hover:text-white transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="px-5 py-4 border-t border-gray-900 flex items-center justify-between">
            <span className="text-xs text-gray-600">Total: <strong className="text-white">{data.total}</strong> members</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>← Prev</button>
              <span className="flex items-center px-2 text-xs text-gray-600">Page {page}</span>
              <button disabled={!data?.items?.length || data.items.length < 20} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer 360 Drawer */}
      {selectedUser && <CustomerDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  )
}
