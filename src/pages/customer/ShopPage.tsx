import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Heart, Sparkles, Leaf } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

const OLIVE       = '#2F4C2C'
const OLIVE_LIGHT = '#4E7749'

const CATEGORIES_BY_LANG = {
  bm: ['Semua Koleksi', 'Minuman Prebiotik', 'Kesihatan Wanita & Botani', 'Superfood Avokado', 'Bijirin Penuh & Koko'],
  en: ['All Categories', 'Prebiotic Drinks', 'Women’s Wellness & Botanicals', 'Avocado Superfood', 'Whole Grains & Cocoa'],
  cn: ['全部系列', '益生元高纤饮', '女性草本调理', '牛油果超级食物', '全麦燕麦与可可'],
}

const DEFAULT_PRODUCTS = {
  bm: [
    {
      id: 'asianmum-purple-sweet-potato',
      name: 'Asian Mum Prebiotik Ubi Ungu (15 Paket)',
      category: 'Minuman Prebiotik',
      tag: '💜 Prebiotik Ubi Ungu',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/purple-sweet-potato.jpg',
      tagClass: 'tag-dopamine-purple',
      highlight: '10.4g Serat Prebiotik Inulin',
      desc: 'Ubi keledek ungu Jepun kaya antioksidan anthocyanin untuk mikrobiom usus & imuniti keluarga.',
    },
    {
      id: 'asianmum-avocado-moringa',
      name: 'Asian Mum Prebiotik Avokado & Moringa (15 Paket)',
      category: 'Superfood Avokado',
      tag: '🥑 Avokado & Moringa',
      retailPrice: 62.00,
      dealerPrice: 45.00,
      bv: 38.00,
      imageUrl: '/images/products/avocado-moringa.jpg',
      tagClass: 'tag-dopamine-green',
      highlight: 'Vitamin E, Selenium & Lemak Sihat',
      desc: 'Nutrisi superfood segar untuk melindungi sel tubuh, tenaga berpanjangan & kesihatan kulit.',
    },
    {
      id: 'asianmum-beaufica-cranberry',
      name: 'Asian Mum Beaufica Kranberi & Kacip Fatimah (20 Sachet)',
      category: 'Kesihatan Wanita & Botani',
      tag: '🌸 Beaufica Kranberi & Kacip Fatimah',
      retailPrice: 78.00,
      dealerPrice: 55.00,
      bv: 48.00,
      imageUrl: '/images/products/beaufica-cranberry.jpg',
      tagClass: 'tag-dopamine-coral',
      highlight: 'Ekstrak Kacip Fatimah & Delima',
      desc: 'Formulasi mewah herba tradisi dan kranberi untuk kesihatan dalaman wanita & seri wajah.',
    },
    {
      id: 'asianmum-mango-passion',
      name: 'Asian Mum Prebiotik Mangga & Markisa (15 Paket)',
      category: 'Minuman Prebiotik',
      tag: '🥭 Mangga & Markisa',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/mango-passion.jpg',
      tagClass: 'tag-dopamine-mango',
      highlight: 'Vitamin C Tropika & Buang Angin',
      desc: 'Rasa ceria dopamine menyegarkan untuk mood positif dan pencernaan lancar setiap hari.',
    },
    {
      id: 'asianmum-cocoa-oat',
      name: 'Asian Mum Prebiotik Koko Gelap & Oat (15 Paket)',
      category: 'Bijirin Penuh & Koko',
      tag: '🍫 Koko Gelap & Gandum Oat',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/cocoa-oat.jpg',
      tagClass: 'tag-dopamine-cocoa',
      highlight: 'Beta-Glukan Oat & Rendah GI',
      desc: 'Kenyang sihat berpanjangan dengan aroma coklat mewah tanpa lemak trans atau kolesterol.',
    },
  ],
  en: [
    {
      id: 'asianmum-purple-sweet-potato',
      name: 'Asian Mum Purple Sweet Potato Prebiotic (15 Sachets)',
      category: 'Prebiotic Drinks',
      tag: '💜 Purple Sweet Potato',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/purple-sweet-potato.jpg',
      tagClass: 'tag-dopamine-purple',
      highlight: '10.4g Prebiotic Inulin Fibre',
      desc: 'Japanese purple yam packed with anthocyanins to nourish gut microbiome & strengthen family immunity.',
    },
    {
      id: 'asianmum-avocado-moringa',
      name: 'Asian Mum Avocado & Moringa Prebiotic (15 Sachets)',
      category: 'Avocado Superfood',
      tag: '🥑 Avocado & Moringa',
      retailPrice: 62.00,
      dealerPrice: 45.00,
      bv: 38.00,
      imageUrl: '/images/products/avocado-moringa.jpg',
      tagClass: 'tag-dopamine-green',
      highlight: 'Vitamin E, Selenium & Healthy Fats',
      desc: 'Fresh superfood vitality to protect cells from oxidative stress and sustain daily energy.',
    },
    {
      id: 'asianmum-beaufica-cranberry',
      name: 'Asian Mum Beaufica Cranberry & Kacip Fatimah (20 Sachets)',
      category: 'Women’s Wellness & Botanicals',
      tag: '🌸 Beaufica Botanical Elixir',
      retailPrice: 78.00,
      dealerPrice: 55.00,
      bv: 48.00,
      imageUrl: '/images/products/beaufica-cranberry.jpg',
      tagClass: 'tag-dopamine-coral',
      highlight: 'Kacip Fatimah & Wild Cranberries',
      desc: 'A luxury botanical formula for female hormonal harmony, urinary tract care and skin glow.',
    },
    {
      id: 'asianmum-mango-passion',
      name: 'Asian Mum Mango & Passionfruit Prebiotic (15 Sachets)',
      category: 'Prebiotic Drinks',
      tag: '🥭 Mango & Passionfruit',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/mango-passion.jpg',
      tagClass: 'tag-dopamine-mango',
      highlight: 'Active Vitamin C & Metabolism',
      desc: 'Uplifting tropical dopamine taste to spark joy, lighten digestion and reduce sluggishness.',
    },
    {
      id: 'asianmum-cocoa-oat',
      name: 'Asian Mum Dark Cocoa & Oat Prebiotic (15 Sachets)',
      category: 'Whole Grains & Cocoa',
      tag: '🍫 Dark Cocoa & Whole Grain Oat',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/cocoa-oat.jpg',
      tagClass: 'tag-dopamine-cocoa',
      highlight: 'Oat Beta-Glucan & Low GI',
      desc: 'Nutritious guilt-free satiety with rich cocoa aroma, zero trans fats and cholesterol support.',
    },
  ],
  cn: [
    {
      id: 'asianmum-purple-sweet-potato',
      name: 'Asian Mum 紫薯益生元高纤饮 (15包装)',
      category: '益生元高纤饮',
      tag: '💜 紫薯益生元',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/purple-sweet-potato.jpg',
      tagClass: 'tag-dopamine-purple',
      highlight: '每份含 10.4g 益生元菊粉',
      desc: '日本优质紫甘薯富含花青素，全面滋养肠道微生态，促进肠道规律排毒与免疫力。',
    },
    {
      id: 'asianmum-avocado-moringa',
      name: 'Asian Mum 牛油果辣木超级食物益生元饮 (15包装)',
      category: '牛油果超级食物',
      tag: '🥑 牛油果辣木',
      retailPrice: 62.00,
      dealerPrice: 45.00,
      bv: 38.00,
      imageUrl: '/images/products/avocado-moringa.jpg',
      tagClass: 'tag-dopamine-green',
      highlight: '维生素 E、天然硒与健康油脂',
      desc: '鲜活超级食物滋养，抵御细胞氧化损伤，全天候维持充沛能量与肌肤光泽。',
    },
    {
      id: 'asianmum-beaufica-cranberry',
      name: 'Asian Mum Beaufica 蔓越莓卡琪花蒂玛植物饮 (20条装)',
      category: '女性草本调理',
      tag: '🌸 Beaufica 蔓越莓草本',
      retailPrice: 78.00,
      dealerPrice: 55.00,
      bv: 48.00,
      imageUrl: '/images/products/beaufica-cranberry.jpg',
      tagClass: 'tag-dopamine-coral',
      highlight: '纯正卡琪花蒂玛与野生蔓越莓',
      desc: '专为现代女性研制的奢华植物草本饮，温和调理内分泌，呵护私密健康，绽放红润好气色。',
    },
    {
      id: 'asianmum-mango-passion',
      name: 'Asian Mum 芒果百香果多巴胺活力益生元饮 (15包装)',
      category: '益生元高纤饮',
      tag: '🥭 芒果百香果',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/mango-passion.jpg',
      tagClass: 'tag-dopamine-mango',
      highlight: '热带维生素 C 与轻盈肠动力',
      desc: '鲜爽多巴胺热带果香，晨起唤醒愉悦好心情，补充天然活性维生素 C。',
    },
    {
      id: 'asianmum-cocoa-oat',
      name: 'Asian Mum 浓黑可可与全麦燕麦益生元饮 (15包装)',
      category: '全麦燕麦与可可',
      tag: '🍫 浓黑可可全麦燕麦',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      imageUrl: '/images/products/cocoa-oat.jpg',
      tagClass: 'tag-dopamine-cocoa',
      highlight: '燕麦 β-葡聚糖 & 低 GI 饱腹',
      desc: '零负担香浓享受，黑可可与纯燕麦带来持久饱腹感，控制食欲，守护心血管健康。',
    },
  ],
}

export default function ShopPage() {
  const { lang, t } = useLanguage()
  const [search, setSearch]       = useState('')
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [wishlist, setWishlist]   = useState<string[]>([])

  const categories = CATEGORIES_BY_LANG[lang] || CATEGORIES_BY_LANG.bm
  const defaultList = DEFAULT_PRODUCTS[lang] || DEFAULT_PRODUCTS.bm

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsApi.list({ search, page: 1 }),
  })

  const apiProducts = data?.items ?? []
  
  const displayProducts = apiProducts.length > 0
    ? apiProducts.map(p => {
        const matchingDefault = defaultList.find(d => d.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(d.name.toLowerCase()))
        return {
          id: p.id,
          name: p.name,
          category: p.category || categories[1] || 'Makanan Kesihatan',
          tag: matchingDefault?.tag || '🌿 Asian Mum Health',
          retailPrice: p.variants?.[0]?.priceRM || 58.00,
          dealerPrice: p.variants?.[0]?.dealerPrice || 42.00,
          bv: p.variants?.[0]?.bv || 35.00,
          imageUrl: p.imageUrl || matchingDefault?.imageUrl || '/images/products/purple-sweet-potato.jpg',
          tagClass: matchingDefault?.tagClass || 'tag-dopamine-purple',
          highlight: matchingDefault?.highlight || '100% Plant-Based & Halal',
          desc: p.description || matchingDefault?.desc || '',
        }
      })
    : defaultList

  const activeCategory = categories[activeCategoryIndex] || categories[0]

  const filteredProducts = displayProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
    if (activeCategoryIndex === 0) return matchesSearch
    return matchesSearch && (p.category === activeCategory || p.name.includes(activeCategory))
  })

  const toggleWishlist = (id: string) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  return (
    <div className="space-y-6 pt-2 pb-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles className="h-3.5 w-3.5" /> {t.shop.bannerTag}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.shop.bannerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            {t.shop.bannerDesc}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden sm:block pointer-events-none">
          <img src="/images/logo.png" alt="" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: OLIVE }} />
        <input
          className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl outline-none transition-all placeholder-gray-400 bg-white border border-emerald-900/10 shadow-xs focus:ring-2 focus:ring-emerald-600/20"
          placeholder={t.shop.searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value) }}
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryIndex(idx)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategoryIndex === idx
                ? 'shadow-md text-white'
                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-emerald-900/10'
            }`}
            style={activeCategoryIndex === idx ? { background: `linear-gradient(135deg, ${OLIVE}, ${OLIVE_LIGHT})` } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl animate-pulse bg-emerald-100/50 h-80" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-emerald-900/10 p-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-emerald-700">
            <ShoppingBag className="h-8 w-8 opacity-60" />
          </div>
          <p className="font-bold text-gray-700 text-lg">{t.shop.noProducts}</p>
          <p className="text-xs text-gray-500 mt-1">{t.shop.noProductsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-3xl overflow-hidden bg-white border border-emerald-900/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Image Wrap */}
                <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-emerald-50/40 p-4 aspect-square">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Dopamine Badge */}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold shadow-xs ${product.tagClass}`}>
                    {product.tag}
                  </span>

                  {/* Wishlist toggle */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product.id) }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </Link>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                    <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{product.highlight}</span>
                  </div>

                  <Link to={`/products/${product.id}`} className="block">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {product.desc}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">{t.shop.retailPrice}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-gray-900">RM {product.retailPrice.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {t.shop.wholesalePrice} RM {product.dealerPrice.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/products/${product.id}`}
                  className="btn-primary py-2.5 px-4 text-xs font-bold shadow-xs shrink-0"
                >
                  {t.shop.viewDetails}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
