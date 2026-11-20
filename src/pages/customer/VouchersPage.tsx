import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ticket, Sparkles, CheckCircle2, Clock, Tag, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { vouchersApi } from '../../api/vouchers'

export default function VouchersPage() {
  const qc = useQueryClient()
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-vouchers'],
    queryFn: vouchersApi.myVouchers,
  })

  const claimMut = useMutation({
    mutationFn: (code: string) => vouchersApi.claim(code),
    onSuccess: (_, code) => {
      setMessage({ type: 'ok', text: `Voucher ${code} claimed and added to your Ready to Use wallet!` })
      qc.invalidateQueries({ queryKey: ['my-vouchers'] })
    },
    onError: (err: any) => {
      setMessage({ type: 'err', text: err?.response?.data?.error || 'Could not claim voucher' })
    },
  })

  const held = data?.held ?? []
  const claimable = data?.claimable ?? []

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A36]">Ascend Perks</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">My Vouchers</h1>
        <p className="text-sm text-slate-500 mt-1">
          Claim exclusive vouchers and apply them directly at checkout for instant savings.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-2xl px-5 py-3.5 text-sm font-bold flex items-center gap-2 ${
            message.type === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {message.text}
        </div>
      )}

      {/* ── Section 1: Ready to Use (Held Vouchers) ──────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#FF5A36]" />
            Ready to Use ({held.length})
          </h2>
          <Link to="/shop" className="text-xs font-extrabold text-[#FF5A36] hover:underline flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" /> Use at Shop
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading your vouchers...</div>
        ) : held.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-orange-200 p-8 text-center">
            <Ticket className="w-10 h-10 text-orange-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No vouchers in your wallet yet</p>
            <p className="text-xs text-slate-400 mt-1">Claim any available voucher below with one click!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {held.map((uv) => {
              const v = uv.voucher
              if (!v) return null
              return (
                <div
                  key={uv.id}
                  className="bg-white rounded-3xl border-2 border-emerald-200 p-5 shadow-soft flex items-center justify-between gap-4 relative overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black">
                        {v.type === 'PERCENT' ? `${v.value}% OFF` : `RM ${v.value} OFF`}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-500">{v.code}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{v.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{v.description}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Min. spend RM {v.minSpend}
                      </span>
                      {uv.expiresAt && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Exp {new Date(uv.expiresAt).toLocaleDateString('en-MY')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/checkout"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00C896] to-[#06B6D4] text-white text-xs font-extrabold shrink-0 hover:opacity-90 transition"
                  >
                    Use Now
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Section 2: Available to Claim ────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FFB800]" />
          Available to Claim ({claimable.length})
        </h2>

        {claimable.length === 0 ? (
          <div className="bg-orange-50/40 rounded-3xl border border-orange-100 p-6 text-center text-xs font-bold text-slate-500">
            You have claimed all available vouchers right now. Check back soon for new drops!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimable.map((v) => (
              <div
                key={v.id}
                className="bg-gradient-to-r from-[#FFF7F2] via-white to-[#FFFBEB] rounded-3xl border-2 border-orange-200/80 p-5 shadow-soft flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF5A36] to-[#FF8A00] text-white text-[11px] font-black">
                      {v.type === 'PERCENT' ? `${v.value}% OFF` : `RM ${v.value} OFF`}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-slate-500">{v.code}</span>
                    {(v as any).firstPurchaseOnly && (
                      <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-extrabold">
                        1st Order Only
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{v.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{v.description}</p>
                  <p className="text-[11px] font-bold text-slate-400">
                    Min. spend RM {v.minSpend}
                    {v.maxDiscount > 0 ? ` • Cap RM ${v.maxDiscount}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => claimMut.mutate(v.code)}
                  disabled={claimMut.isPending}
                  className="btn-primary !px-5 !py-2.5 !text-xs shrink-0"
                >
                  {claimMut.isPending ? 'Claiming...' : 'Claim'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
