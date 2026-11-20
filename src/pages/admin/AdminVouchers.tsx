import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vouchersApi, type CreateVoucherPayload, type UpdateVoucherPayload } from '../../api/vouchers'
import type { Voucher, VoucherRedemption } from '../../types'
import {
  Plus, X, Loader2, Tag, ToggleLeft, ToggleRight, Edit2,
  Trash2, History, ChevronDown, ChevronUp, CheckCircle,
  AlertTriangle, Clock, Percent, DollarSign, Users, Activity
} from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 } as const
const th = 'pb-3 pr-4 text-left text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap'
const td = 'py-4 pr-4 text-sm align-top'

function fmtDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

function voucherStatus(v: Voucher): { label: string; color: string; bg: string; border: string } {
  const now = new Date()
  if (!v.active)
    return { label: 'Inactive', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' }
  if (v.expiresAt && new Date(v.expiresAt) < now)
    return { label: 'Expired', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' }
  if (v.startsAt && new Date(v.startsAt) > now)
    return { label: 'Scheduled', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' }
  if (v.maxQty > 0 && v.usedQty >= v.maxQty)
    return { label: 'Exhausted', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' }
  return { label: 'Active', color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' }
}

type Tab = 'vouchers' | 'redemptions'

export default function AdminVouchers() {
  const [tab, setTab] = useState<Tab>('vouchers')
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [showCreate, setShowCreate] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'vouchers', page, activeFilter],
    queryFn: () => vouchersApi.list({ active: activeFilter, page, pageSize: 20 }),
  })

  const { data: redemptions, isLoading: rdLoading } = useQuery({
    queryKey: ['admin', 'vouchers', 'redemptions', page],
    queryFn: () => vouchersApi.redemptions({ page, pageSize: 20 }),
    enabled: tab === 'redemptions',
  })

  const del = useMutation({
    mutationFn: (id: string) => vouchersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  })

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => vouchersApi.toggleActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] }),
  })

  // Summary stats
  const items = data?.items ?? []
  const totalActive = items.filter(v => voucherStatus(v).label === 'Active').length
  const totalExpired = items.filter(v => voucherStatus(v).label === 'Expired').length
  const totalUsed = items.reduce((a, v) => a + v.usedQty, 0)

  const TABS = [
    { value: 'vouchers' as Tab, label: 'Vouchers', icon: Tag },
    { value: 'redemptions' as Tab, label: 'Redemption Log', icon: History },
  ]

  const FILTERS = [
    { label: 'All', value: undefined },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Vouchers</h1>
          <p className="text-xs text-gray-600 mt-1">Create and manage discount codes and redemption history</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-black"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          <Plus className="h-4 w-4" /> Create Voucher
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Vouchers', value: data?.total ?? 0, icon: Tag, color: GOLD },
          { label: 'Active', value: totalActive, icon: CheckCircle, color: '#4ade80' },
          { label: 'Expired', value: totalExpired, icon: AlertTriangle, color: '#f87171' },
          { label: 'Total Redemptions', value: totalUsed, icon: Activity, color: '#60a5fa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ ...card, padding: 16 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</span>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => { setTab(t.value); setPage(1) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={tab === t.value
              ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
              : { color: '#6b7280' }}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Vouchers Tab ── */}
      {tab === 'vouchers' && (
        <div style={{ ...card, overflow: 'hidden' }}>
          {/* Filter row */}
          <div className="px-5 py-4 border-b border-gray-900 flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Status:</span>
            <div className="flex gap-1">
              {FILTERS.map(f => (
                <button key={String(f.value)} onClick={() => { setActiveFilter(f.value); setPage(1) }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={activeFilter === f.value
                    ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
                    : { border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vouchers...
            </div>
          )}
          {isError && <div className="py-10 text-center text-red-400 text-sm p-5">Failed to load vouchers.</div>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th className={th + " pl-5"}>Code</th>
                    <th className={th}>Name</th>
                    <th className={th}>Type</th>
                    <th className={th}>Value</th>
                    <th className={th}>Min Spend</th>
                    <th className={th}>Max Disc.</th>
                    <th className={th}>Usage</th>
                    <th className={th}>Per User</th>
                    <th className={th}>Validity</th>
                    <th className={th}>Status</th>
                    <th className={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={11} className="py-12 text-center text-gray-600 text-sm">
                      No vouchers yet. Create your first discount code!
                    </td></tr>
                  )}
                  {items.map((v) => {
                    const st = voucherStatus(v)
                    const isExpanded = expandedId === v.id
                    const usagePct = v.maxQty > 0 ? Math.min(100, (v.usedQty / v.maxQty) * 100) : null

                    return (
                      <>
                        <tr key={v.id}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          className="transition-colors hover:bg-white/[0.015]">
                          <td className={td + ' pl-5'}>
                            <div className="font-mono font-black text-base" style={{ color: GOLD }}>{v.code}</div>
                          </td>
                          <td className={td}>
                            <div className="font-semibold text-gray-200 max-w-[160px] truncate">{v.name}</div>
                            {v.description && <div className="text-[10px] text-gray-600 mt-0.5 max-w-[160px] truncate">{v.description}</div>}
                          </td>
                          <td className={td}>
                            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: v.type === 'PERCENT' ? '#a78bfa' : '#34d399' }}>
                              {v.type === 'PERCENT' ? <Percent className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                              {v.type}
                            </div>
                          </td>
                          <td className={td}>
                            <span className="font-black text-white text-base">
                              {v.type === 'PERCENT' ? `${v.value}%` : `RM ${v.value.toFixed(2)}`}
                            </span>
                          </td>
                          <td className={td}>
                            <span className="text-xs text-gray-500">
                              {v.minSpend > 0 ? `RM ${v.minSpend.toFixed(2)}` : '—'}
                            </span>
                          </td>
                          <td className={td}>
                            <span className="text-xs text-gray-500">
                              {v.maxDiscount > 0 ? `RM ${v.maxDiscount.toFixed(2)}` : '—'}
                            </span>
                          </td>
                          <td className={td}>
                            <div>
                              <span className="text-sm font-bold text-white">{v.usedQty}</span>
                              {v.maxQty > 0 && <span className="text-xs text-gray-500">/{v.maxQty}</span>}
                            </div>
                            {usagePct !== null && (
                              <div className="mt-1 h-1 rounded-full bg-gray-800 w-20 overflow-hidden">
                                <div className="h-full rounded-full" style={{
                                  width: `${usagePct}%`,
                                  background: usagePct >= 90 ? '#f87171' : usagePct >= 60 ? '#fbbf24' : '#4ade80'
                                }} />
                              </div>
                            )}
                          </td>
                          <td className={td}>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="h-3 w-3" />
                              {v.perUserLimit === 0 ? '∞' : `×${v.perUserLimit}`}
                            </div>
                          </td>
                          <td className={td}>
                            {(v.startsAt || v.expiresAt) ? (
                              <div className="text-[10px] text-gray-500 space-y-0.5">
                                {v.startsAt && <div className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />From {fmtDate(v.startsAt)}</div>}
                                {v.expiresAt && <div className="flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" />Until {fmtDate(v.expiresAt)}</div>}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-600">No limit</span>
                            )}
                          </td>
                          <td className={td}>
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                              style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                              {st.label}
                            </span>
                          </td>
                          <td className={td}>
                            <div className="flex items-center gap-1.5">
                              {/* Toggle active */}
                              <button
                                onClick={() => toggle.mutate({ id: v.id, active: !v.active })}
                                title={v.active ? 'Deactivate' : 'Activate'}
                                className="text-gray-500 hover:text-white transition-colors">
                                {v.active
                                  ? <ToggleRight className="h-5 w-5 text-green-400" />
                                  : <ToggleLeft className="h-5 w-5" />}
                              </button>
                              {/* Edit */}
                              <button onClick={() => setEditingVoucher(v)}
                                className="text-gray-500 hover:text-white transition-colors">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {/* Expand redemptions */}
                              <button onClick={() => setExpandedId(isExpanded ? null : v.id)}
                                className="text-gray-500 hover:text-white transition-colors">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              {/* Delete */}
                              <button onClick={() => { if (confirm(`Delete voucher "${v.code}"?`)) del.mutate(v.id) }}
                                className="text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Inline redemption history */}
                        {isExpanded && (
                          <tr key={`${v.id}-expanded`}
                            style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <td colSpan={11} className="px-5 py-4">
                              <VoucherRedemptionInline voucherId={v.id} />
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="px-5 py-4 border-t border-gray-900 flex items-center justify-between text-sm">
              <span className="text-gray-600">Total: <strong className="text-white">{data.total}</strong> vouchers</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>← Prev</button>
                <button disabled={items.length < 20} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Redemptions Tab ── */}
      {tab === 'redemptions' && (
        <div style={{ ...card, overflow: 'hidden' }}>
          <div className="px-5 py-4 border-b border-gray-900">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">All Redemption Records</p>
          </div>
          {rdLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!rdLoading && <RedemptionTable items={redemptions?.items ?? []} total={redemptions?.total ?? 0} page={page} setPage={setPage} />}
        </div>
      )}

      {/* Modals */}
      {showCreate && <VoucherFormModal mode="create" onClose={() => setShowCreate(false)} />}
      {editingVoucher && <VoucherFormModal mode="edit" voucher={editingVoucher} onClose={() => setEditingVoucher(null)} />}
    </div>
  )
}

// ── Inline Redemption Mini-table ──────────────────────────────────────────────
function VoucherRedemptionInline({ voucherId }: { voucherId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'vouchers', 'redemptions', voucherId],
    queryFn: () => vouchersApi.redemptions({ voucherId, page: 1, pageSize: 5 }),
  })

  if (isLoading) return <div className="text-xs text-gray-600 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading redemptions…</div>
  if (!data?.items?.length) return <p className="text-xs text-gray-600">No redemptions for this voucher yet.</p>

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3">
        Recent Redemptions ({data.total} total)
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <th className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">User ID</th>
            <th className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">Order ID</th>
            <th className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">Original</th>
            <th className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">Discount</th>
            <th className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">Final</th>
            <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((r: VoucherRedemption) => (
            <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td className="py-2 pr-4 font-mono text-gray-500">{r.userId.slice(0, 8)}…</td>
              <td className="py-2 pr-4 font-mono text-gray-500">{r.orderId.slice(0, 8)}…</td>
              <td className="py-2 pr-4 text-gray-400">RM {r.originalAmount.toFixed(2)}</td>
              <td className="py-2 pr-4 text-green-400 font-semibold">−RM {r.discountAmount.toFixed(2)}</td>
              <td className="py-2 pr-4 font-bold text-white">RM {r.finalAmount.toFixed(2)}</td>
              <td className="py-2 text-gray-600">{new Date(r.redeemedAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Full Redemption Table ─────────────────────────────────────────────────────
function RedemptionTable({ items, total, page, setPage }: {
  items: VoucherRedemption[]
  total: number
  page: number
  setPage: (p: number | ((prev: number) => number)) => void
}) {
  if (!items.length) return <div className="py-12 text-center text-gray-600 text-sm">No redemptions yet.</div>
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th className={th + " pl-5"}>Voucher Code</th>
              <th className={th}>User ID</th>
              <th className={th}>Order ID</th>
              <th className={th}>Original Amt</th>
              <th className={th}>Discount</th>
              <th className={th}>Final Amt</th>
              <th className={th}>Redeemed At</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                className="hover:bg-white/[0.015] transition-colors">
                <td className={td + ' pl-5 font-mono font-black'} style={{ color: GOLD }}>
                  {r.voucher?.code ?? r.voucherId.slice(0, 8)}
                </td>
                <td className={td + ' font-mono text-xs text-gray-500'}>{r.userId.slice(0, 8)}…</td>
                <td className={td + ' font-mono text-xs text-gray-500'}>{r.orderId.slice(0, 8)}…</td>
                <td className={td + ' text-gray-400'}>RM {r.originalAmount.toFixed(2)}</td>
                <td className={td + ' text-green-400 font-semibold'}>−RM {r.discountAmount.toFixed(2)}</td>
                <td className={td + ' font-bold text-white'}>RM {r.finalAmount.toFixed(2)}</td>
                <td className={td + ' text-gray-500 text-xs'}>
                  {new Date(r.redeemedAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-gray-900 flex items-center justify-between">
        <span className="text-xs text-gray-600">Total: <strong className="text-white">{total}</strong> redemptions</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>← Prev</button>
          <button disabled={items.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Next →</button>
        </div>
      </div>
    </>
  )
}

// ── Voucher Form Modal (Create / Edit) ─────────────────────────────────────────
function VoucherFormModal({
  mode,
  voucher,
  onClose,
}: {
  mode: 'create' | 'edit'
  voucher?: Voucher
  onClose: () => void
}) {
  const qc = useQueryClient()

  const [code, setCode] = useState(voucher?.code ?? '')
  const [name, setName] = useState(voucher?.name ?? '')
  const [description, setDescription] = useState(voucher?.description ?? '')
  const [type, setType] = useState<'PERCENT' | 'CASH'>(voucher?.type ?? 'PERCENT')
  const [value, setValue] = useState(String(voucher?.value ?? ''))
  const [minSpend, setMinSpend] = useState(String(voucher?.minSpend ?? '0'))
  const [maxDiscount, setMaxDiscount] = useState(String(voucher?.maxDiscount ?? '0'))
  const [maxQty, setMaxQty] = useState(String(voucher?.maxQty ?? '0'))
  const [perUserLimit, setPerUserLimit] = useState(String(voucher?.perUserLimit ?? '1'))
  const [active, setActive] = useState(voucher?.active ?? true)
  const [startsAt, setStartsAt] = useState(voucher?.startsAt ? voucher.startsAt.slice(0, 10) : '')
  const [expiresAt, setExpiresAt] = useState(voucher?.expiresAt ? voucher.expiresAt.slice(0, 10) : '')

  const mutation = useMutation({
    mutationFn: () => {
      if (mode === 'create') {
        const payload: CreateVoucherPayload = {
          code: code.toUpperCase().trim(),
          name,
          description,
          type,
          value: Number(value),
          minSpend: Number(minSpend),
          maxDiscount: Number(maxDiscount),
          maxQty: Number(maxQty),
          perUserLimit: Number(perUserLimit),
          active,
          startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }
        return vouchersApi.create(payload)
      } else {
        const payload: UpdateVoucherPayload = {
          name, description,
          minSpend: Number(minSpend),
          maxDiscount: Number(maxDiscount),
          maxQty: Number(maxQty),
          perUserLimit: Number(perUserLimit),
          active,
          startsAt: startsAt ? new Date(startsAt).toISOString() : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }
        return vouchersApi.update(voucher!.id, payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'vouchers'] })
      onClose()
    },
  })

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">{children}</label>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, width: '100%', maxWidth: 560 }}
        className="animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(233,30,140,0.08)', border: '1px solid rgba(233,30,140,0.18)' }}>
              <Tag className="h-4 w-4" style={{ color: GOLD }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{mode === 'create' ? 'Create Voucher' : 'Edit Voucher'}</h2>
              <p className="text-[10px] text-gray-600">{mode === 'edit' && voucher ? `Editing: ${voucher.code}` : 'New discount code'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Code (only on create) */}
          {mode === 'create' && (
            <div>
              <Label>Voucher Code *</Label>
              <input className="dark-input font-mono uppercase" value={code} placeholder="e.g. SUMMER25"
                onChange={e => setCode(e.target.value.toUpperCase())} />
              <p className="text-[10px] text-gray-600 mt-1">Letters and numbers only, no spaces.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Voucher Name *</Label>
              <input className="dark-input" value={name} placeholder="e.g. Summer Sale 25%" onChange={e => setName(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <input className="dark-input" value={description} placeholder="Optional description for admin reference" onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Type and Value — only editable on create */}
          {mode === 'create' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type *</Label>
                <div className="flex gap-2 mt-1">
                  {(['PERCENT', 'CASH'] as const).map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={type === t
                        ? { background: `${t === 'PERCENT' ? '#7c3aed' : '#059669'}18`, color: t === 'PERCENT' ? '#a78bfa' : '#34d399', border: `1.5px solid ${t === 'PERCENT' ? '#7c3aed' : '#059669'}40` }
                        : { border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                      {t === 'PERCENT' ? <Percent className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                      {t === 'PERCENT' ? 'Percent' : 'Fixed RM'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Value * {type === 'PERCENT' ? '(%)' : '(RM)'}</Label>
                <input className="dark-input" type="number" min={0} step={type === 'PERCENT' ? 1 : 0.01}
                  value={value} placeholder={type === 'PERCENT' ? '25' : '10.00'} onChange={e => setValue(e.target.value)} />
              </div>
            </div>
          )}

          {/* Constraints */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Spend (RM)</Label>
              <input className="dark-input" type="number" min={0} step={0.01} value={minSpend} placeholder="0 = no minimum" onChange={e => setMinSpend(e.target.value)} />
            </div>
            {mode === 'create' && type === 'PERCENT' && (
              <div>
                <Label>Max Discount (RM)</Label>
                <input className="dark-input" type="number" min={0} step={0.01} value={maxDiscount} placeholder="0 = no cap" onChange={e => setMaxDiscount(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Max Total Uses</Label>
              <input className="dark-input" type="number" min={0} value={maxQty} placeholder="0 = unlimited" onChange={e => setMaxQty(e.target.value)} />
            </div>
            <div>
              <Label>Per-User Limit</Label>
              <input className="dark-input" type="number" min={0} value={perUserLimit} placeholder="1 = one-time per user" onChange={e => setPerUserLimit(e.target.value)} />
            </div>
          </div>

          {/* Validity dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date (optional)</Label>
              <input className="dark-input" type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
            </div>
            <div>
              <Label>Expiry Date (optional)</Label>
              <input className="dark-input" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
          </div>

          {/* Active toggle */}
          <div>
            <Label>Status</Label>
            <button onClick={() => setActive(a => !a)}
              className="flex items-center gap-3 mt-1">
              <div className="w-10 h-5 rounded-full transition-all relative"
                style={{ background: active ? GOLD : 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: active ? '1.25rem' : '0.125rem' }} />
              </div>
              <span className="text-sm font-semibold text-white">{active ? 'Active — will be visible to customers' : 'Inactive — hidden from customers'}</span>
            </button>
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-400 p-3 rounded-xl bg-red-900/20 border border-red-800/30">
              {(mutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Operation failed.'}
            </p>
          )}
        </div>

        <div className="px-6 py-5 border-t border-gray-900 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button disabled={mutation.isPending || !name || (mode === 'create' && (!code || !value))}
            onClick={() => mutation.mutate()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mutation.isPending ? 'Saving…' : mode === 'create' ? 'Create Voucher' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
