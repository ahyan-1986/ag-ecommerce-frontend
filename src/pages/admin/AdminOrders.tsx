import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../api/orders'
import { Loader2, X, Search, MapPin, Package, AlertCircle } from 'lucide-react'
import { OrderTrackingBanner } from '../../components/ui/OrderTrackingBanner'
import type { Order } from '../../types'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const STATUSES = ['', 'pending_payment', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']
const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 } as const
const th = 'pb-3 pr-4 text-left text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap'
const td = 'py-4 pr-4 text-sm align-top'

function statusColor(s: string) {
  if (s === 'delivered') return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' }
  if (s === 'shipped') return { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' }
  if (s === 'processing' || s === 'packed' || s === 'paid') return { bg: 'rgba(233,30,140,0.08)', color: '#D4AF37', border: 'rgba(233,30,140,0.18)' }
  if (s === 'cancelled' || s === 'refunded') return { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' }
  return { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: 'rgba(107,114,128,0.2)' }
}

export default function AdminOrders() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [fulfillingOrder, setFulfillingOrder] = useState<Order | null>(null)
  
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'orders', status, search, page],
    queryFn: () => ordersApi.list({ status: status || undefined, search: search || undefined, page, pageSize: 20 }),
  })

  const updateFulfillment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; trackingNumber?: string } }) =>
      ordersApi.updateFulfillment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      setFulfillingOrder(null)
      setViewingOrder(null) // Close detail view so it refreshes next time
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-xs text-gray-600 mt-1">Enterprise order management and fulfillment</p>
        </div>
      </div>

      <div style={card} className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-900 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                className="dark-input w-full pl-10"
                placeholder="Search order no, email, or name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select
              className="dark-select w-40"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            >
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading orders...
          </div>
        )}
        {isError && <div className="py-10 text-center text-red-400 text-sm">Failed to load orders.</div>}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th + " pl-5"}>Order #</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Date</th>
                  <th className={th}>Status</th>
                  <th className={th}>Amount</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-600 text-sm">No orders found</td></tr>
                )}
                {data?.items?.map((order) => {
                  const sc = statusColor(order.status)
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className={td + ' pl-5'}>
                        <div className="font-mono font-bold" style={{ color: GOLD }}>{order.orderNo}</div>
                        <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">{order.paymentMethod}</div>
                      </td>
                      <td className={td}>
                        <div className="font-semibold text-white">{order.shippingName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{order.user?.email}</div>
                      </td>
                      <td className={td}>
                        <div className="text-gray-300">{new Date(order.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className={td}>
                        <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={td + ' whitespace-nowrap'}>
                        <div className="font-semibold text-white">RM {(order.totalAmount ?? 0).toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{order.items?.length || 0} items</div>
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewingOrder(order)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            View
                          </button>
                          <button onClick={() => setFulfillingOrder(order)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-black transition-opacity hover:opacity-90 whitespace-nowrap"
                            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                            Fulfill
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && (
          <div className="p-5 border-t border-gray-900 flex items-center justify-between text-sm">
            <span className="text-gray-600">Total: <strong className="text-white">{data.total}</strong> orders</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>← Prev</button>
              <button disabled={!(data?.items?.length) || (data.items.length < data.pageSize)} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onFulfill={() => setFulfillingOrder(viewingOrder)}
        />
      )}

      {/* Fulfill Modal */}
      {fulfillingOrder && (
        <FulfillModal
          order={fulfillingOrder}
          onClose={() => setFulfillingOrder(null)}
          onSave={(s, t) => updateFulfillment.mutate({ id: fulfillingOrder.id, data: { status: s, trackingNumber: t } })}
          loading={updateFulfillment.isPending}
        />
      )}
    </div>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onFulfill }: { order: Order; onClose: () => void; onFulfill: () => void }) {
  const sc = statusColor(order.status)
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-xl h-full bg-[#0a0a0a] border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-6 border-b border-gray-900 flex items-start justify-between bg-[#111]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-black text-white">{order.orderNo}</h2>
              <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-xl bg-gray-900/50"><X className="h-5 w-5" /></button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Tracking Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Fulfillment Timeline</h3>
            <OrderTrackingBanner orderStatus={order.status} shippingStatus={order.shippingStatus} compact />
            {order.trackingNumber && (
              <div className="mt-4 p-3 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center gap-3">
                <Package className="h-4 w-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500">Tracking: </span>
                  <span className="font-mono text-white ml-1">{order.trackingNumber}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Customer Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Customer</h3>
              <div className="text-sm space-y-1 text-gray-300">
                <p className="font-semibold text-white">{order.shippingName}</p>
                <p>{order.user?.email}</p>
                <p>{order.shippingPhone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Delivery Address
              </h3>
              <div className="text-sm space-y-1 text-gray-300">
                <p>{order.shippingLine1}</p>
                {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                <p>{order.shippingPostcode} {order.shippingCity}</p>
                <p>{order.shippingState}, {order.shippingCountry}</p>
              </div>
            </div>
          </div>

          {/* Affiliate info (if exists) */}
          {order.user?.referralCode && (
            <div className="p-4 rounded-xl bg-[rgba(233,30,140,0.05)] border border-[rgba(233,30,140,0.12)] flex gap-3">
              <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: GOLD }}>Consultant Referral</p>
                <p className="text-xs text-gray-400 mt-1">This order was made by a user in the MLM network. Commissions may be tied to this order.</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Order Items</h3>
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-400">Item</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-gray-400">Price</th>
                    <th className="py-2.5 px-4 text-center text-xs font-semibold text-gray-400">Qty</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-200">{item.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.variantName} <span className="font-mono">({item.sku})</span></p>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400">RM {item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center text-gray-300">x{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-200">RM {(item.unitPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>RM {((order.totalAmount ?? 0) - (order.shippingFee ?? 0) + (order.discountAmount ?? 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>RM {(order.shippingFee ?? 0).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>- RM {order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-gray-800">
                <span>Total</span>
                <span style={{ color: GOLD }}>RM {(order.totalAmount ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-900 bg-[#111] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Close
          </button>
          <button onClick={onFulfill} className="px-6 py-2.5 rounded-xl text-sm font-black text-black transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            Update Fulfillment
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Fulfill Modal ─────────────────────────────────────────────────────────────
function FulfillModal({ order, onClose, onSave, loading }: {
  order: Order
  onClose: () => void
  onSave: (status: string, tracking?: string) => void
  loading: boolean
}) {
  const [status, setStatus] = useState<string>(order.status === 'paid' ? 'processing' : order.status)
  const [tracking, setTracking] = useState(order.trackingNumber || '')
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420 }} className="animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Update Status</h2>
            <p className="text-xs text-gray-500 mt-1">Order {order.orderNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Order Status</label>
            <select className="dark-select w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.filter(s => s && s !== 'pending_payment').map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Tracking Number (optional)</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input className="dark-input w-full pl-10 font-mono" value={tracking} placeholder="e.g. POS123456MY" onChange={(e) => setTracking(e.target.value)} />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Entering a tracking number will automatically set the shipping status.</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 transition-colors hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button disabled={loading} onClick={() => onSave(status, tracking || undefined)}
            className="px-6 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60 flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  )
}
