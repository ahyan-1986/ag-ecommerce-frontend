import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../api/orders'
import {
  Printer, ArrowLeft, CheckCircle, Package, Loader2,
  Link2, Download, MapPin, Phone, Hash, Calendar,
  CreditCard, Truck, Tag, ShieldCheck,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { OrderTrackingBanner } from '../../components/ui/OrderTrackingBanner'

const COMPANY = {
  name: 'hoPme',
  tagline: "Malaysia's Premium Pet Supply Store",
  address: 'Kuala Lumpur, Malaysia',
  email: 'support@asianmum.my',
  website: 'asianmum.my',
  phone: '+60 11-0000 0000',
  ssm: 'SSM: 1234567-A',
  sstReg: 'SST: Exempt (Schedule A, Group G)',
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function formatShortDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fmt(val?: number) {
  return (val ?? 0).toFixed(2)
}

function invoiceNo(orderNo: string) {
  return `INV-${orderNo}`
}

function getEstimatedDelivery(paidAt?: string): string {
  if (!paidAt) return '—'
  const d = new Date(paidAt)
  d.setDate(d.getDate() + 5) // 3–7 business days; show 5 as midpoint
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' })
}

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

// ── Label / value pair ────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false, color }: {
  label: string; value: React.ReactNode; mono?: boolean; color?: string
}) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-gray-500 print:text-gray-600 shrink-0">{label}</span>
      <span
        className={`text-right break-all ${mono ? 'font-mono' : 'font-medium'} ${color ?? 'text-gray-200 print:text-gray-800'}`}
      >
        {value}
      </span>
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] print:text-yellow-700 font-bold mb-3">
      {children}
    </p>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent print:via-yellow-300 my-1" />
  )
}

export default function OrderReceiptPage() {
  const { orderNo } = useParams<{ orderNo: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-receipt', orderNo],
    queryFn: () => ordersApi.myOrderByNo(orderNo!),
    enabled: !!orderNo,
    retry: 2,
  })

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
          <p className="text-sm text-gray-500">Loading invoice…</p>
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#080808] text-gray-900 gap-4">
        <Package className="h-16 w-16 text-gray-600" />
        <p className="text-gray-400">Invoice not found or access denied.</p>
        <button onClick={() => navigate('/orders')} className="text-[#D4AF37] underline text-sm">
          Back to Orders
        </button>
      </div>
    )
  }

  const subtotal       = order.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const sstAmount      = 0   // Pet supplies are SST-exempt in Malaysia
  const receiptUrl     = window.location.href
  const courierUrl     = getCourierUrl(order.courier, order.trackingNumber)
  const estimatedDelivery = getEstimatedDelivery(order.paidAt ?? order.createdAt)

  const isPaid = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status)

  return (
    <div className="min-h-screen bg-[#080808] py-8 px-4 print:bg-white print:py-0 print:px-0">

      {/* ── Action bar (hidden when printing) ── */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
          >
            <Link2 className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/60 px-4 py-2 text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* ── Invoice card ── */}
      <div className="max-w-3xl mx-auto rounded-2xl border border-[#D4AF37]/20 bg-[#0e0e0e] shadow-2xl overflow-hidden print:border-0 print:shadow-none print:rounded-none print:bg-white">

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <div className="relative bg-gradient-to-br from-[#1a1400] to-[#0e0e0e] px-8 py-8 print:bg-white print:border-b-2 print:border-yellow-400">

          {/* Watermark — print only */}
          {isPaid && (
            <div className="hidden print:block absolute top-6 right-8 rotate-[-12deg] opacity-10 pointer-events-none select-none">
              <span className="text-5xl font-black text-green-600 uppercase tracking-widest border-4 border-green-600 px-3 py-1 rounded">PAID</span>
            </div>
          )}

          <div className="flex items-start justify-between">
            {/* Company identity */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-4xl font-black tracking-tight text-[#D4AF37] print:text-yellow-600">
                  ho<span className="text-gray-900 print:text-black">P</span>me
                </span>
              </div>
              <p className="text-xs text-gray-500 print:text-gray-600">{COMPANY.tagline}</p>
              <p className="text-xs text-gray-600 print:text-gray-500 mt-0.5">{COMPANY.ssm}</p>
              <p className="text-xs text-gray-700 print:text-gray-400 mt-0.5">{COMPANY.sstReg}</p>
            </div>

            {/* Invoice badge */}
            <div className="text-right">
              {isPaid && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-900/40 px-3 py-1 text-xs font-bold text-green-400 border border-green-700/40 mb-2 print:hidden">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Payment Verified
                </div>
              )}
              <p className="text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-400">Tax Invoice / Receipt</p>
              <p className="text-xl font-black text-gray-900 print:text-black mt-0.5 font-mono">{invoiceNo(order.orderNo)}</p>
            </div>
          </div>

          {/* Gold divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent print:via-yellow-400" />

          {/* Meta grid */}
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-400">Invoice No.</p>
              <p className="text-sm font-black text-gray-900 print:text-black font-mono mt-0.5">{invoiceNo(order.orderNo)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-400">Order Ref.</p>
              <p className="text-sm font-mono font-medium text-gray-300 print:text-gray-700 mt-0.5">{order.orderNo}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-400">Date Issued</p>
              <p className="text-sm font-medium text-gray-300 print:text-gray-700 mt-0.5">{formatDate(order.paidAt ?? order.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-400">Payment Method</p>
              <p className="text-sm font-medium text-gray-300 print:text-gray-700 mt-0.5 capitalize">{order.paymentMethod ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* ══ ORDER STATUS TIMELINE ════════════════════════════════════════════ */}
        <div className="px-8 py-5 border-b border-gray-900 print:border-gray-200 print:bg-gray-50">
          <SectionHeading>Order Progress</SectionHeading>
          <OrderTrackingBanner
            orderStatus={order.status}
            shippingStatus={order.shippingStatus}
          />
        </div>

        {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 space-y-6 print:px-8 print:py-4">

          {/* Customer & Payment */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Deliver To */}
            <div className="rounded-xl border border-gray-800 bg-[#141414] p-4 print:border-gray-200 print:bg-gray-50">
              <SectionHeading>
                <MapPin className="h-3 w-3 inline mr-1" />Ship To
              </SectionHeading>
              <p className="text-sm font-bold text-gray-900 print:text-black">{order.shippingName}</p>
              <p className="text-xs text-gray-400 print:text-gray-600 flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />{order.shippingPhone}
              </p>
              <div className="mt-2 text-xs text-gray-500 print:text-gray-600 leading-relaxed">
                <p>{order.shippingLine1}</p>
                {order.shippingLine2 && <p>{order.shippingLine2}</p>}
                <p>{order.shippingPostcode} {order.shippingCity}</p>
                <p>{order.shippingState}, {order.shippingCountry || 'Malaysia'}</p>
              </div>
            </div>

            {/* Payment & Fulfilment */}
            <div className="rounded-xl border border-gray-800 bg-[#141414] p-4 space-y-2 print:border-gray-200 print:bg-gray-50">
              <SectionHeading>
                <CreditCard className="h-3 w-3 inline mr-1" />Payment &amp; Shipment
              </SectionHeading>
              <InfoRow label="Order Status" value={
                <span className={
                  order.status === 'delivered' ? 'text-green-400 print:text-green-700' :
                  order.status === 'shipped'   ? 'text-blue-400 print:text-blue-700'   :
                  order.status === 'cancelled' ? 'text-red-400 print:text-red-700'     :
                  'text-[#D4AF37] print:text-yellow-700'
                }>{order.status.replace('_', ' ').toUpperCase()}</span>
              } />
              {order.paymentRef && (
                <InfoRow label="Transaction Ref" value={order.paymentRef} mono />
              )}
              {order.paidAt && (
                <InfoRow label="Paid On" value={formatShortDate(order.paidAt)} />
              )}
              {order.trackingNumber ? (
                <InfoRow
                  label={<span className="flex items-center gap-1"><Truck className="h-3 w-3" />Tracking</span> as any}
                  value={
                    courierUrl
                      ? <a href={courierUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[#D4AF37] underline print:text-yellow-700 font-mono">
                          {order.trackingNumber}
                        </a>
                      : <span className="font-mono text-[#D4AF37] print:text-yellow-700">{order.trackingNumber}</span>
                  }
                />
              ) : (
                <InfoRow label={<span className="flex items-center gap-1"><Truck className="h-3 w-3" />Est. Delivery</span> as any}
                  value={estimatedDelivery} />
              )}
              {order.courier && (
                <InfoRow label="Courier" value={order.courier} />
              )}
              {order.voucherCode && (
                <InfoRow
                  label={<span className="flex items-center gap-1"><Tag className="h-3 w-3" />Voucher</span> as any}
                  value={<span className="font-mono text-green-400 print:text-green-700">{order.voucherCode}</span>}
                />
              )}
            </div>
          </div>

          {/* Items table */}
          <div>
            <SectionHeading>
              <Hash className="h-3 w-3 inline mr-1" />Items Ordered
            </SectionHeading>
            <div className="rounded-xl border border-gray-800 overflow-hidden print:border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#181818] print:border-gray-200 print:bg-gray-100">
                    <th className="py-3 px-4 text-left text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-600 font-bold">Description</th>
                    <th className="py-3 px-4 text-right text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-600 font-bold whitespace-nowrap">Unit Price</th>
                    <th className="py-3 px-4 text-center text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-600 font-bold">Qty</th>
                    <th className="py-3 px-4 text-right text-[10px] uppercase tracking-widest text-gray-500 print:text-gray-600 font-bold">Amount (MYR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 print:divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id} className="bg-[#0e0e0e] hover:bg-[#161616] transition-colors print:bg-white">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-10 w-10 rounded-lg object-cover border border-gray-700 shrink-0 print:hidden"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 print:text-black leading-snug">{item.productName}</p>
                            {item.variantName && item.variantName !== item.productName && (
                              <p className="text-xs text-gray-500 print:text-gray-600 mt-0.5">{item.variantName}</p>
                            )}
                            <p className="text-[10px] text-gray-600 print:text-gray-500 font-mono mt-0.5">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-300 print:text-gray-700 whitespace-nowrap">
                        RM {fmt(item.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-300 print:text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900 print:text-black whitespace-nowrap">
                        RM {fmt(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals + QR */}
          <div className="flex flex-col sm:flex-row justify-between gap-6">

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-[#141414] p-4 print:border-gray-200 print:bg-white gap-2 self-start">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG
                  value={receiptUrl}
                  size={90}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
              <p className="text-[9px] text-gray-600 print:text-gray-400 text-center uppercase tracking-wider">
                Scan to verify
              </p>
            </div>

            {/* Totals */}
            <div className="flex-1 max-w-xs rounded-xl border border-gray-800 bg-[#141414] p-4 space-y-2.5 print:border-gray-200 print:bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 print:text-gray-600">Subtotal</span>
                <span className="text-gray-200 print:text-gray-800">RM {fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 print:text-gray-600">Shipping</span>
                <span className="text-gray-200 print:text-gray-800">
                  {(order.shippingFee ?? 0) === 0
                    ? <span className="text-green-400 print:text-green-700 font-semibold">FREE</span>
                    : `RM ${fmt(order.shippingFee)}`
                  }
                </span>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 print:text-gray-600">
                    Voucher {order.voucherCode ? `(${order.voucherCode})` : 'Discount'}
                  </span>
                  <span className="text-green-400 print:text-green-700">− RM {fmt(order.discountAmount)}</span>
                </div>
              )}

              <Divider />

              {/* SST row — Malaysian compliance */}
              <div className="flex items-start justify-between text-xs gap-2">
                <span className="text-gray-500 print:text-gray-600">SST (Sales &amp; Service Tax)</span>
                <span className="text-right text-gray-500 print:text-gray-600">
                  {sstAmount === 0 ? (
                    <span className="text-gray-600 print:text-gray-400 text-[10px]">Exempt</span>
                  ) : (
                    `RM ${fmt(sstAmount)}`
                  )}
                </span>
              </div>

              <Divider />

              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 print:text-black text-base">Total Paid</span>
                <span className="text-xl font-black text-[#D4AF37] print:text-yellow-600">
                  RM {fmt(order.totalAmount)}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 print:text-gray-400 text-right">MYR — Malaysian Ringgit</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-gray-800 bg-[#141414] p-4 print:border-gray-200 print:bg-gray-50">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 print:text-gray-500">Order Notes</p>
              <p className="text-sm text-gray-400 print:text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Digital verification */}
          <div className="rounded-xl border border-[#D4AF37]/10 bg-[#D4AF37]/[0.03] p-4 flex items-center gap-3 print:border-yellow-200 print:bg-yellow-50">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37] print:text-yellow-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#D4AF37] print:text-yellow-700">Digitally Verified by hoPme</p>
              <p className="text-[10px] text-gray-600 print:text-gray-500 mt-0.5">
                Issued {formatDate(order.paidAt ?? order.createdAt)} · {COMPANY.ssm} · {COMPANY.sstReg}
              </p>
            </div>
          </div>
        </div>

        {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
        <div className="border-t border-gray-800 px-8 py-6 text-center space-y-2 print:border-gray-200 print:py-4">
          <p className="text-sm font-bold text-[#D4AF37] print:text-yellow-600">
            Thank you for shopping with hoPme! 🐾
          </p>
          <p className="text-xs text-gray-600 print:text-gray-500">
            Questions? Reach us at{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-[#D4AF37] underline print:text-yellow-700">{COMPANY.email}</a>
            {' '}·{' '}
            <a href={`https://${COMPANY.website}`} className="text-[#D4AF37] underline print:text-yellow-700">{COMPANY.website}</a>
            {' '}·{' '}{COMPANY.phone}
          </p>
          <p className="text-[10px] text-gray-700 print:text-gray-400">
            This is an official electronic tax invoice. No physical invoice will be issued unless requested.
          </p>
          <p className="text-[10px] text-gray-800 print:text-gray-300 font-mono">
            {COMPANY.ssm} · {COMPANY.address} · {invoiceNo(order.orderNo)}
          </p>
        </div>

      </div>

      {/* ── Print-only: download hint ── */}
      <div className="hidden print:block text-center mt-8 text-xs text-gray-400">
        <Calendar className="h-3 w-3 inline mr-1" />
        Generated {new Date().toLocaleString('en-MY')} · {COMPANY.website}
      </div>

      {/* ── Action bar bottom (mobile convenience) ── */}
      <div className="max-w-3xl mx-auto mt-6 flex justify-center gap-3 print:hidden">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          My Orders
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-colors hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #B8860B, #D4AF37)' }}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>
    </div>
  )
}
