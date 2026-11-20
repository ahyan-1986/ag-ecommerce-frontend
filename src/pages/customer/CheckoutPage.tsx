import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MapPin,
  Tag,
  Gift,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Truck,
  Ticket,
  AlertCircle,
} from 'lucide-react'
import { ordersApi } from '../../api/orders'
import { vouchersApi } from '../../api/vouchers'
import { walletApi } from '../../api/wallet'
import { useAuth } from '../../contexts/AuthContext'

const MALAYSIA_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'WP Kuala Lumpur', 'Labuan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
]

export default function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: ordersApi.getCart,
  })
  const { data: wallet } = useQuery({
    queryKey: ['my-wallet'],
    queryFn: walletApi.getMyWallet,
  })
  const { data: myVouchers } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: vouchersApi.myVouchers,
  })

  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingLine1, setShippingLine1] = useState('')
  const [shippingLine2, setShippingLine2] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('Selangor')
  const [shippingPostcode, setShippingPostcode] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | 'points'>('cod')

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null)
  const [voucherErr, setVoucherErr] = useState('')

  // Aameba origin/dev PointsBlock state (1 Loyalty Point = RM 1.00)
  const [pointsInput, setPointsInput] = useState('')
  const [appliedPoints, setAppliedPoints] = useState(0)

  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setShippingName((v) => v || `${user.firstName} ${user.lastName}`.trim())
    setShippingPhone((v) => v || user.phone || '')
    setShippingLine1((v) => v || user.addressLine1 || '')
    setShippingLine2((v) => v || user.addressLine2 || '')
    setShippingCity((v) => v || user.city || '')
    if (user.state) setShippingState(user.state)
    setShippingPostcode((v) => v || user.postcode || '')
  }, [user])

  const subTotal = cartItems.reduce((sum, item) => sum + (item.variant?.retailPrice || 0) * item.quantity, 0)
  const totalBV = cartItems.reduce((sum, item) => sum + ((item.variant as any)?.bv || item.variant?.retailPrice || 0) * item.quantity, 0)
  const estRebatePoints = Math.round(totalBV * 0.15 * 100) / 100
  const availablePoints = wallet?.pointsBalance || 0
  const voucherDiscount = appliedVoucher?.discount || 0
  const afterVoucher = Math.max(0, subTotal - voucherDiscount)
  const effectivePoints = Math.min(appliedPoints, availablePoints, afterVoucher)
  const finalTotal = Math.max(0, Math.round((afterVoucher - effectivePoints) * 100) / 100)

  const validateVoucherMut = useMutation({
    mutationFn: (code: string) => vouchersApi.validate(code, subTotal),
    onSuccess: (res) => {
      setAppliedVoucher({ code: res.voucher.code, discount: res.discountAmount })
      setVoucherCode(res.voucher.code)
      setVoucherErr('')
    },
    onError: (err: any) => {
      setVoucherErr(err?.response?.data?.error || 'Voucher is not applicable')
      setAppliedVoucher(null)
    },
  })

  const checkoutMut = useMutation({
    mutationFn: () =>
      ordersApi.checkout({
        voucherCode: appliedVoucher?.code || undefined,
        pointsToUse: effectivePoints > 0 ? effectivePoints : undefined,
        paymentMethod: finalTotal === 0 ? 'points' : paymentMethod,
        shippingRateId: '',
        shippingName,
        shippingPhone,
        shippingLine1,
        shippingLine2,
        shippingCity,
        shippingState,
        shippingPostcode,
        shippingCountry: 'Malaysia',
        notes,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['my-wallet'] })
      qc.invalidateQueries({ queryKey: ['member-dashboard'] })
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl
      } else {
        navigate(`/orders/${res.order.id}/receipt`)
      }
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || 'Checkout failed. Please check your details.')
    },
  })

  const handleApplyPoints = () => {
    const val = parseFloat(pointsInput)
    if (!Number.isFinite(val) || val <= 0) {
      setAppliedPoints(0)
      return
    }
    const clamped = Math.min(val, availablePoints, afterVoucher)
    setAppliedPoints(Math.round(clamped * 100) / 100)
    setPointsInput(clamped.toFixed(2))
  }

  if (cartLoading) {
    return <div className="p-12 text-center text-sm font-bold text-slate-400">Loading your checkout...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-orange-100 p-12 text-center space-y-4">
        <p className="text-lg font-extrabold text-slate-900">Your cart is empty</p>
        <Link to="/shop" className="btn-primary">
          Browse Ascend Shop
        </Link>
      </div>
    )
  }

  const heldVouchers = myVouchers?.held ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF5A36] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Checkout</h1>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-[#00A37B]">
          <Sparkles className="w-4 h-4" /> Earn +{estRebatePoints.toFixed(2)} pts Self Rebate on this order!
        </span>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3.5 text-sm font-bold text-rose-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          checkoutMut.mutate()
        }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start"
      >
        {/* ── Left Column: Delivery, Vouchers, Loyalty Points, Payment ──── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Details */}
          <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5A36]" /> Delivery Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Recipient Name</label>
                <input value={shippingName} onChange={(e) => setShippingName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} className="input" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 1</label>
                <input value={shippingLine1} onChange={(e) => setShippingLine1(e.target.value)} placeholder="Unit / House No., Street" className="input" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 2 (Optional)</label>
                <input value={shippingLine2} onChange={(e) => setShippingLine2(e.target.value)} placeholder="Building / Taman" className="input" />
              </div>
              <div>
                <label className="label">City</label>
                <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">State</label>
                <select value={shippingState} onChange={(e) => setShippingState(e.target.value)} className="input">
                  {MALAYSIA_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Postcode (Digits Only)</label>
                <input
                  value={shippingPostcode}
                  onChange={(e) => setShippingPostcode(e.target.value.replace(/\D/g, ''))}
                  placeholder="55100"
                  maxLength={6}
                  className="input font-mono"
                  required
                />
              </div>
              <div>
                <label className="label">Order Notes (Optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Leave at guardhouse..." className="input" />
              </div>
            </div>
          </div>

          {/* Voucher Block (with Held Vouchers Quick Picker) */}
          <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FFB800]" /> Apply Voucher
            </h2>
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code (e.g. DOPAMINE15)"
                className="input font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => voucherCode && validateVoucherMut.mutate(voucherCode)}
                disabled={validateVoucherMut.isPending}
                className="btn-secondary !py-2.5 !px-5 !text-xs shrink-0"
              >
                Apply
              </button>
            </div>
            {voucherErr && <p className="text-xs font-bold text-rose-500">{voucherErr}</p>}
            {appliedVoucher && (
              <p className="text-xs font-extrabold text-[#00A37B] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Voucher {appliedVoucher.code} applied (-RM {appliedVoucher.discount.toFixed(2)})
              </p>
            )}

            {heldVouchers.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Your Ready-to-Use Vouchers
                </p>
                <div className="flex flex-wrap gap-2">
                  {heldVouchers.map((uv) =>
                    uv.voucher ? (
                      <button
                        key={uv.id}
                        type="button"
                        onClick={() => validateVoucherMut.mutate(uv.voucher!.code)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-extrabold text-[#FF5A36] transition"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        {uv.voucher.code}
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Aameba origin/dev Loyalty Points Block (Pay with Points at Checkout!) */}
          <div className="bg-gradient-to-r from-[#FFF7F2] via-white to-[#ECFEF9] rounded-3xl border-2 border-emerald-200 p-6 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#00C896]" /> Pay with Loyalty Points
              </h2>
              <span className="text-xs font-extrabold text-[#00A37B] bg-emerald-100 px-3 py-1 rounded-full">
                Available: {availablePoints.toFixed(2)} pts
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Redeem your Loyalty Points directly at checkout (1 point = RM 1.00).
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max={Math.min(availablePoints, afterVoucher)}
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                placeholder="Enter points to apply"
                className="input"
              />
              <button
                type="button"
                onClick={handleApplyPoints}
                className="btn-mint !py-2.5 !px-5 !text-xs shrink-0"
              >
                Apply Points
              </button>
              {availablePoints > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const maxPts = Math.round(Math.min(availablePoints, afterVoucher) * 100) / 100
                    setPointsInput(maxPts.toFixed(2))
                    setAppliedPoints(maxPts)
                  }}
                  className="btn-outline !py-2.5 !px-4 !text-xs shrink-0"
                >
                  Use Max
                </button>
              )}
            </div>
            {effectivePoints > 0 && (
              <p className="text-xs font-extrabold text-[#00A37B] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {effectivePoints.toFixed(2)} Loyalty Points applied (-RM {effectivePoints.toFixed(2)})
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF5A36]" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  paymentMethod === 'cod'
                    ? 'border-[#FF5A36] bg-orange-50/70'
                    : 'border-slate-200 hover:border-orange-200'
                }`}
              >
                <p className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#FF5A36]" /> Instant Demo / COD
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Confirms order &amp; credits MLM bonus immediately</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  paymentMethod === 'stripe'
                    ? 'border-[#FF5A36] bg-orange-50/70'
                    : 'border-slate-200 hover:border-orange-200'
                }`}
              >
                <p className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#00C896]" /> Online Payment (Card / FPX)
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Secure Stripe gateway (instant fallback in demo)</p>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Order Summary ───────────────────────────────── */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft space-y-5 sticky top-32">
          <h2 className="text-lg font-extrabold text-slate-900">Order Summary</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl bg-orange-50 overflow-hidden shrink-0 border border-orange-100">
                    {item.variant?.product?.imageUrl && (
                      <img src={item.variant.product.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5A36] text-white text-[10px] font-black flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{item.variant?.product?.name || item.variant?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.variant?.name}</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-800 text-xs whitespace-nowrap">
                  RM {((item.variant?.retailPrice || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-orange-100 pt-4 space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>RM {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-[#00A37B] font-extrabold">FREE</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-[#00A37B] font-bold">
                <span>Voucher ({appliedVoucher?.code})</span>
                <span>-RM {voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            {effectivePoints > 0 && (
              <div className="flex justify-between text-[#00A37B] font-bold">
                <span>Loyalty Points ({effectivePoints.toFixed(2)} pts)</span>
                <span>-RM {effectivePoints.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-orange-100">
              <span>Total Payable</span>
              <span className="text-[#FF5A36]">RM {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/70 p-3.5 text-xs flex items-center justify-between">
            <span className="font-bold text-slate-700">Self Rebate Earned (15% of {totalBV} BV)</span>
            <span className="font-black text-[#00A37B]">+{estRebatePoints.toFixed(2)} pts</span>
          </div>

          <button type="submit" disabled={checkoutMut.isPending} className="btn-primary w-full !py-3.5 !text-base">
            {checkoutMut.isPending ? 'Placing Order...' : `Place Order • RM ${finalTotal.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
