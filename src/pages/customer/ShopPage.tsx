import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Sparkles, ShoppingBag, Heart, ArrowRight } from 'lucide-react'
import { productsApi } from '../../api/products'
import { useLanguage } from '../../contexts/LanguageContext'

const CATEGORIES = [
  { key: 'ALL', en: 'All Collections', zh: '全部系列' },
  { key: 'Daily Vitality', en: 'Daily Vitality', zh: '每日活力' },
  { key: 'Beauty & Glow', en: 'Beauty & Glow', zh: '焕颜美肌' },
  { key: 'Superfood Blends', en: 'Superfood Blends', zh: '超级食物' },
  { key: 'Gut Health', en: 'Gut Health', zh: '肠道平衡' },
  { key: 'Value Bundles', en: 'Value Bundles', zh: '超值套装' },
]

const CARD_THEMES = [
  { bg: 'from-orange-50 via-amber-50 to-yellow-50', border: 'border-orange-200/80', pill: 'bg-orange-100 text-[#E84420]' },
  { bg: 'from-pink-50 via-rose-50 to-fuchsia-50', border: 'border-pink-200/80', pill: 'bg-pink-100 text-pink-700' },
  { bg: 'from-emerald-50 via-teal-50 to-cyan-50', border: 'border-emerald-200/80', pill: 'bg-emerald-100 text-[#00A37B]' },
  { bg: 'from-violet-50 via-purple-50 to-pink-50', border: 'border-violet-200/80', pill: 'bg-violet-100 text-violet-700' },
]

export default function ShopPage() {
  const { isZh } = useLanguage()
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('ALL')
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['shop-products', search],
    queryFn: () => productsApi.list({ search: search || undefined, pageSize: 50 }),
  })

  const products = (data?.items ?? []).filter((p) => {
    if (selectedCat === 'ALL') return true
    return (p.category || '').toLowerCase() === selectedCat.toLowerCase()
  })

  return (
    <div className="space-y-8 pb-10">
      {/* ── Bright Dopamine Shop Hero Banner (Zero Dark Colors!) ─────────── */}
      <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-[#FF5A36] via-[#FF8A00] to-[#FFB800] p-8 sm:p-11 text-white shadow-pop">
        <div className="pointer-events-none absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute right-24 -bottom-16 w-56 h-56 rounded-full bg-[#00C896]/35 blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/25 backdrop-blur-sm text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              {isZh ? 'Ascend Group 活力多巴胺营养系列' : 'Ascend Group Vibrant Wellness Collection'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {isZh
                ? '唤醒每日活力，畅享 15% 积分回馈'
                : 'Vibrant Daily Wellness & Instant 15% Loyalty Points'}
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              {isZh
                ? '100% 天然植萃配方、无添加蔗糖。每笔消费即刻累积 BV 与积分，分享好友更能升级 Ascend 圈层！'
                : '100% plant-powered superfoods with zero added sugar. Every box earns instant BV & 15% Loyalty Points you can spend at checkout or cash out.'}
            </p>
          </div>
          <Link
            to="/membership"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#FF5A36] font-extrabold text-sm shadow-lg hover:scale-105 transition self-start lg:self-center shrink-0"
          >
            {isZh ? '查看会员层级奖励' : 'View Tier Rewards'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Search & Category Pills ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isZh
                ? '搜索益生元饮品、胶原蛋白、抹茶超级食物或超值套装...'
                : 'Search prebiotic blends, collagen glow, matcha superfoods, or starter bundles...'
            }
            className="input !pl-12 !py-3.5 !rounded-2xl shadow-soft"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#FF5A36] to-[#FF8A00] text-white shadow-coral-sm'
                    : 'bg-white text-slate-600 border border-orange-100 hover:border-[#FF5A36] hover:text-[#FF5A36]'
                }`}
              >
                {isZh ? cat.zh : cat.en}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-orange-50/70 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-orange-200 p-12 text-center space-y-2">
          <ShoppingBag className="w-10 h-10 text-orange-300 mx-auto" />
          <p className="font-extrabold text-slate-700">
            {isZh ? '暂无符合条件的产品' : 'No products matched your filter'}
          </p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedCat('ALL')
            }}
            className="text-xs font-extrabold text-[#FF5A36] hover:underline"
          >
            {isZh ? '重置筛选' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, idx) => {
            const theme = CARD_THEMES[idx % CARD_THEMES.length]
            const v = p.variants?.[0]
            const price = v?.priceRM ?? 0
            const bv = v?.bv ?? price
            const estPoints = Math.round(bv * 0.15 * 100) / 100
            const displayName = isZh && (p as any).nameZh ? (p as any).nameZh : p.name

            return (
              <div
                key={p.id}
                className={`group bg-white rounded-3xl border-2 ${theme.border} overflow-hidden shadow-soft card-hover flex flex-col`}
              >
                <div className={`relative h-60 bg-gradient-to-br ${theme.bg} p-4 overflow-hidden`}>
                  <Link to={`/products/${p.id}`} className="block w-full h-full">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-[#FF5A36]/40" />
                      </div>
                    )}
                  </Link>

                  <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-white/95 text-[11px] font-extrabold text-[#00A37B] shadow-sm">
                    +{estPoints.toFixed(0)} {isZh ? '积分回馈' : 'pts rebate'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setLiked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                    className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition"
                    aria-label="Favorite"
                  >
                    <Heart className={`w-4 h-4 ${liked[p.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${theme.pill}`}>
                        {p.category || 'Ascend Wellness'}
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-400">{bv} BV</span>
                    </div>
                    <Link to={`/products/${p.id}`}>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#FF5A36] transition line-clamp-2">
                        {displayName}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xl font-black text-slate-900">RM {price.toFixed(2)}</p>
                      <p className="text-[11px] font-bold text-[#00A37B]">
                        {isZh ? '15% 自购积分回馈' : '15% Self Rebate'}
                      </p>
                    </div>
                    <Link to={`/products/${p.id}`} className="btn-primary !py-2 !px-5 !text-xs">
                      {isZh ? '立即选购' : 'View Product'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
