import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../api/orders'
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const OLIVE = '#2F4C2C'
const GOLD = '#C5963B'

export default function CartPage() {
  const qc = useQueryClient()
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: ordersApi.getCart,
  })

  const updateItem = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      ordersApi.updateCartItem(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  const removeItem = useMutation({
    mutationFn: (id: string) => ordersApi.removeCartItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  })

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.variant?.retailPrice ?? 0) * item.quantity,
    0
  )

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto py-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-gray-100" />
        ))}
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-emerald-900/10 shadow-sm max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `${OLIVE}10` }}>
          <ShoppingBag className="h-8 w-8 opacity-60" style={{ color: GOLD }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Troli Belian Kosong</h2>
        <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
          Anda belum menambah sebarang produk kesihatan ke dalam troli belian.
        </p>
        <Link to="/shop" 
          className="py-2.5 px-6 text-xs font-bold shadow-md inline-flex items-center gap-2 rounded-xl text-white"
          style={{ background: OLIVE }}>
          <ArrowLeft className="h-4 w-4" /> Beli Produk Kesihatan
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Troli Belian Anda</h1>
          <p className="text-xs text-gray-500 mt-0.5">{cartItems.length} jenis produk dalam senarai</p>
        </div>
        <Link to="/shop" className="text-xs font-bold hover:underline flex items-center gap-1" style={{ color: OLIVE }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Sambung Membeli
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => {
            const price = item.variant?.retailPrice ?? 0
            const total = price * item.quantity
            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-xs flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  {item.variant?.product?.imageUrl 
                    ? <img src={item.variant.product.imageUrl} alt={item.variant.name} className="w-full h-full object-contain" />
                    : <ShoppingBag className="h-6 w-6 text-gray-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{item.variant?.product?.name}</h3>
                  <p className="text-[11px] text-gray-500">{item.variant?.name}</p>
                  <p className="text-xs font-black mt-1" style={{ color: OLIVE }}>RM {price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
                  <button
                    onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-white text-xs font-bold">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold text-gray-900 px-1">{item.quantity}</span>
                  <button
                    onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-white text-xs font-bold">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="font-black text-sm text-gray-900">RM {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => removeItem.mutate(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-gray-900 text-base border-b pb-3">Ringkasan Pesanan</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Jumlah Kecil (Subtotal)</span>
              <span className="font-bold text-gray-900">RM {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Penghantaran</span>
              <span className="text-gray-400 italic">Dikira semasa pembayaran</span>
            </div>
          </div>

          <div className="border-t pt-3 flex justify-between font-black text-base text-gray-900">
            <span>Anggaran Jumlah</span>
            <span style={{ color: OLIVE }}>RM {subtotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="w-full py-3 px-4 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 text-center text-white" style={{ background: OLIVE }}>
            <span>Teruskan ke Pembayaran</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
