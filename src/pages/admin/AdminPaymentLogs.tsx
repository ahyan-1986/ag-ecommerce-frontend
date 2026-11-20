import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from '../../api/payments'
import type { PaymentLog, PaymentLogDetail, PaymentLogStatus } from '../../types'
import { Activity, X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Clock, MinusCircle } from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'


const statusMeta: Record<PaymentLogStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  received:  { label: 'Received',  color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  icon: <Clock className="h-3.5 w-3.5" /> },
  processed: { label: 'Processed', color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  failed:    { label: 'Failed',    color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   icon: <AlertCircle className="h-3.5 w-3.5" /> },
  ignored:   { label: 'Ignored',   color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)', icon: <MinusCircle className="h-3.5 w-3.5" /> },
}

function StatusBadge({ status }: { status: PaymentLogStatus }) {
  const m = statusMeta[status] ?? statusMeta.ignored
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      {m.icon}{m.label}
    </span>
  )
}

function amountDisplay(cents: number, currency: string) {
  if (cents === 0) return '—'
  return `${currency || 'MYR'} ${(cents / 100).toFixed(2)}`
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({ logId, onClose }: { logId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery<PaymentLogDetail>({
    queryKey: ['payment-log', logId],
    queryFn: () => paymentsApi.get(logId),
  })

  let prettyPayload = ''
  if (data?.rawPayload) {
    try { prettyPayload = JSON.stringify(JSON.parse(data.rawPayload), null, 2) }
    catch { prettyPayload = data.rawPayload }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5" style={{ color: GOLD }} />
            <span className="font-bold text-white">Webhook Event Detail</span>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-transparent" style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
          </div>
        )}

        {data && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Gateway',     value: <span className="uppercase font-mono">{data.gateway}</span> },
                { label: 'Event Type',  value: <span className="font-mono text-xs">{data.eventType}</span> },
                { label: 'Status',      value: <StatusBadge status={data.status} /> },
                { label: 'Amount',      value: amountDisplay(data.amountCents, data.currency) },
                { label: 'Order #',     value: data.orderNo || '—' },
                { label: 'Transaction', value: <span className="font-mono text-xs truncate">{data.gatewayTxnId || '—'}</span> },
                { label: 'IP Address',  value: data.ipAddress || '—' },
                { label: 'Received',    value: new Date(data.createdAt).toLocaleString('en-MY') },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] text-gray-600 mb-1">{label}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              ))}
            </div>

            {data.errorMessage && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-xs font-bold text-red-400 mb-1">Error</p>
                <p className="text-sm text-red-300">{data.errorMessage}</p>
              </div>
            )}

            {/* Raw payload */}
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Raw Payload</p>
              <pre className="text-xs leading-relaxed overflow-x-auto rounded-lg p-4"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', color: '#a3e635', maxHeight: 360 }}>
                {prettyPayload || '(empty)'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const GATEWAYS = ['', 'stripe']
const STATUSES: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'processed', label: 'Processed' },
  { value: 'failed',    label: 'Failed' },
  { value: 'ignored',   label: 'Ignored' },
  { value: 'received',  label: 'Received' },
]
const EVENT_TYPES: Array<{ value: string; label: string }> = [
  { value: '', label: 'All events' },
  { value: 'checkout.session.completed',      label: 'checkout.session.completed' },
  { value: 'payment_intent.succeeded',        label: 'payment_intent.succeeded' },
  { value: 'payment_intent.payment_failed',   label: 'payment_intent.payment_failed' },
  { value: 'charge.refunded',                 label: 'charge.refunded' },
  { value: 'unknown',                         label: 'unknown (bad signature)' },
]

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: 24,
}

const th = 'text-left text-xs font-bold text-gray-600 uppercase tracking-wider px-4 py-3'
const td = 'px-4 py-3 text-sm text-gray-300'

const sel = 'text-sm rounded-xl px-3 py-2 text-white outline-none appearance-none cursor-pointer'
const selStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }

export default function AdminPaymentLogs() {
  const [gateway, setGateway] = useState('')
  const [status, setStatus] = useState('')
  const [eventType, setEventType] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payment-logs', gateway, status, eventType, page],
    queryFn: () => paymentsApi.list({ gateway: gateway || undefined, status: status || undefined, eventType: eventType || undefined, page, pageSize: 20 }),
  })

  const logs: PaymentLog[] = data?.items ?? []
  const total = data?.total ?? 0

  const resetPage = () => setPage(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          <Activity className="h-5 w-5 text-black" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Payment Gateway Logs</h1>
          <p className="text-sm text-gray-500">All inbound Stripe webhook events</p>
        </div>
      </div>

      {/* Filters */}
      <div style={card}>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Gateway */}
          <select className={sel} style={selStyle} value={gateway} onChange={e => { setGateway(e.target.value); resetPage() }}>
            <option value="">All gateways</option>
            {GATEWAYS.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Status */}
          <select className={sel} style={selStyle} value={status} onChange={e => { setStatus(e.target.value); resetPage() }}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Event type */}
          <select className={sel} style={{ ...selStyle, minWidth: 260 }} value={eventType} onChange={e => { setEventType(e.target.value); resetPage() }}>
            {EVENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>

          <span className="ml-auto text-xs text-gray-600">{total} record{total !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <span className="animate-spin h-8 w-8 rounded-full border-4 border-t-transparent" style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
          </div>
        )}

        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th}>Time</th>
                  <th className={th}>Gateway</th>
                  <th className={th}>Event Type</th>
                  <th className={th}>Order #</th>
                  <th className={th}>Amount</th>
                  <th className={th}>Status</th>
                  <th className={th}>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-700 text-sm">
                      No webhook events found
                    </td>
                  </tr>
                )}
                {logs.map(log => (
                  <tr key={log.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(233,30,140,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSelected(log.id)}>
                    <td className={td + ' text-gray-500 font-mono text-xs whitespace-nowrap'}>
                      {new Date(log.createdAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className={td}>
                      <span className="uppercase font-bold text-xs" style={{ color: GOLD }}>{log.gateway}</span>
                    </td>
                    <td className={td + ' font-mono text-xs text-gray-400'}>{log.eventType}</td>
                    <td className={td}>
                      {log.orderNo
                        ? <span className="font-mono font-bold text-white">{log.orderNo}</span>
                        : <span className="text-gray-700">—</span>}
                    </td>
                    <td className={td + ' font-semibold text-white'}>{amountDisplay(log.amountCents, log.currency)}</td>
                    <td className={td}><StatusBadge status={log.status} /></td>
                    <td className={td + ' font-mono text-xs text-gray-600'}>{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between mt-5 pt-5 text-sm"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-gray-600">
              Page <strong className="text-white">{page}</strong> · {total} total
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button disabled={logs.length < (data.pageSize ?? 20)} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && <DetailModal logId={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
