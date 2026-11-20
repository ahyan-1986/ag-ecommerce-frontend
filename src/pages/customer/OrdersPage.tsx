import { useEffect, useRef, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ordersApi } from '../../api/orders'
import { Badge, orderStatusVariant } from '../../components/ui/Badge'
import { OrderTrackingBanner } from '../../components/ui/OrderTrackingBanner'
import type { Order } from '../../types'
import type { AxiosError } from 'axios'
import {
  Package, CheckCircle, AlertCircle, ReceiptText, Loader2,
  ChevronDown, ChevronUp, Copy, Check, Search, Truck,
  ExternalLink, RefreshCw, ShoppingBag, ClipboardList,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all',        label: 'All Orders' },
  { key: 'pending',    label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped',    label: 'Shipped' },
  { key: 'delivered',  label: 'Delivered' },
  { key: 'cancelled',  label: 'Cancelled' },
]

function getCourierUrl(courier?: string, trackingNo?: string): string | null {
  if (!trackingNo) return null
  const c = (courier ?? '').toLowerCase()
  if (c.includes('jnt') || c.includes('j&t'))    return `https://www.jtexpress.my/track?billCode=${trackingNo}`
  if (c.includes('pos') || c.includes('poslaju')) return `https://www.pos.com.my/track-trace/postal?barcode=${trackingNo}`
  if (c.includes('dhl'))                          return `https://www.dhl.com/my-en/home/tracking.html?tracking-id=${trackingNo}`
  if (c.includes('gdex'))                         return `https://www.gdexpress.com/track?trackingno=${trackingNo}`
  if (c.includes('ninja'))                        return `https://www.ninjavan.co/en-my/tracking?id=${trackingNo}`
  return null
}

// ── Mini "Copy" button with feedback ─────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function doCopy(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      onClick={doCopy}
      title="Copy order number"
      className="ml-1 p-1 rounded text-gray-600 hover:text-[#D4AF37] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

// ── Inline expanded order detail ──────────────────────────────────────────────
function OrderDetail({ order }: { order: Order }) {
  const courierUrl = getCourierUrl(order.courier, order.trackingNumber)

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
      {/* Timeline */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Status Pesanan</p>
        <OrderTrackingBanner orderStatus={order.status} shippingStatus={order.shippingStatus} compact />
      </div>

      {/* Items */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Senarai Produk</p>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl p-3 bg-gray-50/80 border border-gray-100">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName}
                    className="h-10 w-10 rounded-lg object-contain bg-white border border-gray-200 shrink-0 p-0.5" />
                : <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{item.productName}</p>
                {item.variantName && item.variantName !== item.productName && (
                  <p className="text-[11px] text-gray-500">{item.variantName}</p>
                )}
                <p className="text-[10px] font-mono text-gray-400">SKU: {item.sku}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500">× {item.quantity}</p>
                <p className="text-xs font-black text-emerald-900">RM {(item.totalPrice ?? 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking info */}
      {order.trackingNumber && (
        <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-emerald-50/60 border border-emerald-900/10">
          <div className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-emerald-800" />
            <div>
              <p className="text-[11px] text-gray-500">{order.courier || 'Kurier'}</p>
              <p className="text-xs font-mono font-bold text-emerald-900">{order.trackingNumber}</p>
            </div>
          </div>
          {courierUrl && (
            <a href={courierUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all shadow-xs">
              Jejak <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ── Single order card ─────────────────────────────────────────────────────────
function OrderCard({ order, defaultExpanded = false, navigate }: {
  order: Order
  defaultExpanded?: boolean
  navigate: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const canViewReceipt = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status)

  const firstImages = (order.items ?? [])
    .filter((i) => i.imageUrl)
    .slice(0, 3)
    .map((i) => i.imageUrl)

  return (
    <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-xs overflow-hidden transition-all duration-200">
      {/* Card header — always visible */}
      <div
        className="p-5 cursor-pointer hover:bg-gray-50/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Product thumbnails stack */}
          <div className="flex items-center gap-1.5 shrink-0">
            {firstImages.length > 0
              ? firstImages.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    className="h-12 w-12 rounded-xl object-contain bg-gray-50 border border-gray-200 p-0.5"
                    style={{ marginLeft: idx > 0 ? -12 : 0, zIndex: firstImages.length - idx }}
                  />
                ))
              : <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
            }
          </div>

          {/* Order info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-black font-mono text-gray-900 text-sm">{order.orderNo}</span>
              <CopyBtn text={order.orderNo} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleString('ms-MY', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
              {order.shippingStatus && (
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  🚚 {order.shippingStatus}
                </span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="text-right shrink-0">
            <p className="text-base font-black text-emerald-950">
              RM {(order.totalAmount ?? 0).toFixed(2)}
            </p>
            <div className="mt-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
              {canViewReceipt && (
                <button
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-900/20 text-emerald-900 hover:bg-emerald-50 inline-flex items-center gap-1 transition-colors"
                  onClick={() => navigate(`/orders/${order.orderNo}/receipt`)}
                >
                  <ReceiptText className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Resit</span>
                </button>
              )}
              <button
                className="text-gray-400 hover:text-gray-600 p-1"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {expanded && <OrderDetail order={order} />}
      </div>
    </div>
  )
}

// ── Capture banner ────────────────────────────────────────────────────────────
function CaptureBanner({
  status,
  message,
  onRetry,
}: {
  status: 'idle' | 'verifying' | 'pending' | 'success' | 'error'
  message: string
  onRetry: () => void
}) {
  if (status === 'idle') return null
  if (status === 'verifying' || status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.07] p-4 mb-4 text-[#D4AF37]">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    )
  }
  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-700/40 bg-green-900/20 p-4 mb-4 text-green-300">
        <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
        <p className="text-sm font-medium">{message} Redirecting to your invoice…</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4 mb-4 text-red-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Payment verification error</p>
          <p className="text-xs mt-0.5 text-red-400">{message}</p>
        </div>
      </div>
      <button
        className="mt-3 w-full rounded-lg border border-red-600/50 py-1.5 text-xs font-medium text-red-300 hover:bg-red-800/30 transition-colors"
        onClick={onRetry}
      >
        Retry Verification
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const paid            = searchParams.get('paid') === '1'
  const paidOrderNumber = searchParams.get('order') ?? ''
  const stripeSessionId = searchParams.get('session_id') ?? ''

  const [polling, setPolling]         = useState(paid)
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'verifying' | 'pending' | 'success' | 'error'>('idle')
  const [captureMsg, setCaptureMsg]   = useState('')
  const retryTimerRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const captureAttempts               = useRef(0)

  const [activeTab, setActiveTab]   = useState<StatusFilter>('all')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)

  // Collapse paid order number expansion when just returned from Stripe
  const highlightedOrderNo = paidOrderNumber || ''

  // Stop polling after 30s
  useEffect(() => {
    if (!paid) return
    const t = window.setTimeout(() => setPolling(false), 30_000)
    return () => window.clearTimeout(t)
  }, [paid])

  const capture = useMutation({
    mutationFn: ({ orderNo, sessionId }: { orderNo: string; sessionId: string }) =>
      ordersApi.capturePayment(orderNo, sessionId),

    onSuccess: async (res) => {
      captureAttempts.current = 0
      setCaptureStatus('success')
      setCaptureMsg(res.message || 'Payment verified!')
      setPolling(false)
      await qc.invalidateQueries({ queryKey: ['my-orders'] })
      if (res.order?.orderNo) {
        setTimeout(() => navigate(`/orders/${res.order.orderNo}/receipt`), 1200)
      }
    },

    onError: (err: AxiosError<{ error?: string; pending?: boolean }>) => {
      const serverMsg = err.response?.data?.error ?? ''
      const isPending = err.response?.data?.pending === true || serverMsg.startsWith('payment_pending')

      if (isPending && captureAttempts.current < 6) {
        captureAttempts.current += 1
        const delay = Math.min(3000 * captureAttempts.current, 15_000)
        setCaptureStatus('pending')
        setCaptureMsg(`Verifying payment… attempt ${captureAttempts.current}/6`)
        retryTimerRef.current = setTimeout(() => {
          capture.mutate({ orderNo: paidOrderNumber, sessionId: stripeSessionId })
        }, delay)
      } else {
        setPolling(false)
        setCaptureStatus('error')
        const friendly = serverMsg
          ? serverMsg.replace(/^stripe_error:\s*/i, '').replace(/^payment_pending:\s*/i, '')
          : 'Could not verify payment. Please contact support if your order does not update.'
        setCaptureMsg(friendly)
      }
    },
  })

  useEffect(() => {
    if (!paidOrderNumber) return
    setCaptureStatus('verifying')
    setCaptureMsg('Verifying payment with Stripe…')
    capture.mutate({ orderNo: paidOrderNumber, sessionId: stripeSessionId })
    return () => { if (retryTimerRef.current) clearTimeout(retryTimerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidOrderNumber])

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => ordersApi.myOrders(page),
    refetchInterval: polling ? 3000 : false,
  })

  // Client-side filter + search (server data already paginated)
  const allOrders: Order[] = data?.items ?? []

  const filtered = useMemo(() => {
    let list = allOrders
    if (activeTab !== 'all') {
      list = list.filter((o) => o.status === activeTab)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((o) =>
        o.orderNo.toLowerCase().includes(q) ||
        o.items?.some((i) => i.productName?.toLowerCase().includes(q))
      )
    }
    return list
  }, [allOrders, activeTab, search])

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-5">

      {/* Capture banner */}
      <CaptureBanner
        status={captureStatus}
        message={captureMsg}
        onRetry={() => {
          captureAttempts.current = 0
          setCaptureStatus('verifying')
          setCaptureMsg('Retrying verification…')
          capture.mutate({ orderNo: paidOrderNumber, sessionId: stripeSessionId })
        }}
      />

      {/* Payment received banner */}
      {paid && captureStatus !== 'success' && captureStatus !== 'verifying' && captureStatus !== 'pending' && (
        <div className="flex items-center gap-3 rounded-xl border border-green-700/40 bg-green-900/20 p-4 text-green-300">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
          <p className="text-sm font-medium">
            Payment received{paidOrderNumber ? ` for order ${paidOrderNumber}` : ''}. Your order is being processed.
          </p>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-[#D4AF37]" />
          <h1 className="text-xl font-black text-gray-900">My Orders</h1>
          {data?.total != null && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-gray-400"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {data.total} total
            </span>
          )}
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['my-orders'] })}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#D4AF37] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number or product name…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition"
          style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === 'all'
            ? allOrders.length
            : allOrders.filter((o) => o.status === tab.key).length
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0"
              style={
                active
                  ? { background: 'linear-gradient(135deg, #B8860B, #D4AF37)', color: '#000' }
                  : { background: 'rgba(0,0,0,0.02)', color: '#9ca3af',
                      border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  active ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse"
              style={{ background: 'rgba(0,0,0,0.03)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Package className="h-14 w-14 mx-auto text-gray-800" />
          <p className="text-gray-500 font-medium">
            {search
              ? `No orders matching "${search}"`
              : activeTab !== 'all'
              ? `No ${activeTab} orders yet`
              : 'No orders yet'}
          </p>
          {activeTab === 'all' && !search && (
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 mt-2"
              style={{ background: 'linear-gradient(135deg, #B8860B, #D4AF37)' }}
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              navigate={navigate}
              defaultExpanded={order.orderNo === highlightedOrderNo}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <span className="text-xs text-gray-500">
            Page <span className="text-gray-900 font-bold">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
