import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Gift, Users, Crown, ShoppingBag, Star, CheckCircle2 } from 'lucide-react'
import { productsApi } from '../api/products'
import { PublicStoreLayout } from '../layouts/PublicStoreLayout'
import { TierBadge } from '../components/tier/TierBadge'

export default function LandingPage() {
  const { data: featuredRes } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.list({ featured: true, pageSize: 4 }),
    retry: false,
  })
  const featured = featuredRes?.items ?? []

  return (
    <PublicStoreLayout>
      <div className="space-y-16 pb-8">
        {/* ── Dopamine Hero Section (Bright, Sunny, Energetic) ──────────────── */}
        <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#FFF2ED] via-[#FFFBEB] to-[#E9FDF6] border-2 border-orange-100 p-8 sm:p-12 lg:p-16 shadow-pop">
          {/* Playful soft gradient orbs */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FFB800]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#00C896]/20 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200 shadow-sm text-xs font-extrabold text-[#FF5A36]">
                <Sparkles className="w-4 h-4 text-[#FFB800]" />
                ASCEND GROUP • WELLNESS + REWARD CIRCLE
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                Fuel Your{' '}
                <span className="bg-gradient-to-r from-[#FF5A36] via-[#FF8A00] to-[#EC4899] bg-clip-text text-transparent">
                  Vibrant Glow.
                </span>
                <br />
                Grow &amp;{' '}
                <span className="bg-gradient-to-r from-[#00C896] to-[#06B6D4] bg-clip-text text-transparent">
                  Earn Together.
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
                Discover joyful daily superfoods designed for unstoppable energy — and unlock{' '}
                <strong className="text-slate-900">15% Self Rebate</strong>,{' '}
                <strong className="text-slate-900">15% 2-Level Referral Rebates</strong>, and up to{' '}
                <strong className="text-slate-900">45% Leadership Bonus</strong> as you ascend our 4-star circle!
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link to="/shop" className="btn-primary !px-8 !py-3.5 !text-base">
                  <ShoppingBag className="w-5 h-5" />
                  Explore Shop
                </Link>
                <Link to="/membership" className="btn-mint !px-7 !py-3.5 !text-base">
                  <Crown className="w-5 h-5" />
                  See Ascend Tiers
                </Link>
                <Link to="/register" className="btn-secondary !px-7 !py-3.5 !text-base">
                  Join Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Highlight Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-soft hover:-translate-y-1 transition">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF5A36] to-[#FF8A00] text-white flex items-center justify-center mb-3 shadow-coral-sm">
                  <Gift className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-slate-900">15%</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Instant Self Rebate on Every Order BV</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-soft hover:-translate-y-1 transition mt-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00C896] to-[#06B6D4] text-white flex items-center justify-center mb-3 shadow-mint-sm">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-slate-900">L1 &amp; L2</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">15% Referral Rebate Across 2 Generations</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-soft hover:-translate-y-1 transition">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFB800] to-[#F59E0B] text-white flex items-center justify-center mb-3 shadow-sun-sm">
                  <Crown className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-slate-900">Up to 45%</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Leadership Bonus (S1 15% • S2 30% • S3 45%)</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border-2 border-pink-100 shadow-soft hover:-translate-y-1 transition mt-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] text-white flex items-center justify-center mb-3">
                  <Star className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-slate-900">RM 1 = 1 pt</p>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Pay at Checkout or Redeem Cash Anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Dopamine Products ───────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A36]">Fresh &amp; Vibrant</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Bestselling Ascend Blends</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#FF5A36] hover:underline">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((p, idx) => {
              const v = p.variants?.[0]
              const price = v?.priceRM ?? 0
              const bv = v?.bv ?? price
              const estPoints = Math.round(bv * 0.15 * 100) / 100
              const bgAccents = [
                'from-orange-50 to-amber-50 border-orange-100',
                'from-pink-50 to-rose-50 border-pink-100',
                'from-emerald-50 to-cyan-50 border-emerald-100',
                'from-violet-50 to-fuchsia-50 border-violet-100',
              ]
              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className={`group rounded-3xl bg-white border-2 ${bgAccents[idx % 4].split(' ')[2]} overflow-hidden shadow-soft card-hover flex flex-col`}
                >
                  <div className={`relative h-52 bg-gradient-to-br ${bgAccents[idx % 4]} p-4 flex items-center justify-center overflow-hidden`}>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <Sparkles className="w-12 h-12 text-[#FF5A36]/40" />
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-extrabold text-[#00A37B] shadow-sm">
                      +{estPoints.toFixed(0)} pts rebate
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5A36]">
                        {p.category || 'Wellness'}
                      </p>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-2 group-hover:text-[#FF5A36] transition">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-lg font-black text-slate-900">RM {price.toFixed(2)}</p>
                        <p className="text-[11px] font-bold text-slate-400">{bv} BV</p>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-extrabold group-hover:bg-[#FF5A36] group-hover:text-white transition">
                        Shop
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── 4-Tier Ascend Circle Showcase ────────────────────────────────── */}
        <section className="rounded-[2.25rem] bg-gradient-to-r from-[#FFF5F2] via-[#FFFFFF] to-[#F0FDF9] border-2 border-orange-100 p-8 sm:p-12 shadow-soft">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#00A37B]">Ascend Circle Program</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              The More You Grow, The More You Earn
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Start as a Member on your very first order, invite friends to unlock One Star, and lead thriving circles up to Three Star.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                rank: 'M' as const,
                reach: 'Sign up & place your first order',
                highlight: '15% Self & Referral Rebate',
                perks: ['15% points on own orders', '15% on L1 & L2 friends', 'Pay with points at checkout'],
                border: 'border-teal-200 bg-teal-50/30',
              },
              {
                rank: 'S1' as const,
                reach: '10 spending friends + RM 8,000 spend',
                highlight: '+15% Leadership Bonus',
                perks: ['All Member benefits', '+15% Leadership Bonus (LRB)', 'Free Ascend wellness events'],
                border: 'border-amber-200 bg-amber-50/40',
              },
              {
                rank: 'S2' as const,
                reach: '5 direct legs reaching One Star',
                highlight: '+30% Leadership Bonus',
                perks: ['Differential 30% LRB rate', 'Priority VIP launches', 'Leadership retreat invites'],
                border: 'border-rose-200 bg-rose-50/40',
              },
              {
                rank: 'S3' as const,
                reach: '5 direct legs reaching Two Star',
                highlight: '+45% Top Leadership Bonus',
                perks: ['Maximum 45% LRB rate', 'Elite Ambassador recognition', 'Exclusive annual bonus trips'],
                border: 'border-violet-200 bg-violet-50/40',
              },
            ].map((tier) => (
              <div key={tier.rank} className={`rounded-3xl border-2 p-6 flex flex-col justify-between gap-4 ${tier.border}`}>
                <div className="space-y-3">
                  <TierBadge rank={tier.rank} size="md" />
                  <p className="text-lg font-black text-slate-900">{tier.highlight}</p>
                  <p className="text-xs font-bold text-slate-500">{tier.reach}</p>
                  <ul className="space-y-2 pt-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#00C896] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/membership" className="btn-primary !px-8">
              Compare Full Tier Benefits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </PublicStoreLayout>
  )
}
