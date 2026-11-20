import { useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import { ordersApi } from '../../api/orders'
import {
  ShoppingCart, ArrowLeft, Minus, Plus, LogIn,
  ShieldCheck, CheckCircle2, Check
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

const MOCK_DETAILS_BY_LANG = {
  bm: {
    'asianmum-purple-sweet-potato': {
      name: 'Asian Mum Prebiotik Ubi Ungu (15 Paket x 20g)',
      category: 'Minuman Prebiotik',
      tag: '💜 Dopamine Violet',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      pv: 20.00,
      imageUrl: '/images/products/purple-sweet-potato.jpg',
      tagClass: 'tag-dopamine-purple',
      highlights: [
        '10.4g Serat Prebiotik Inulin setiap hidangan',
        'Kaya Anthocyanin semulajadi dari Ubi Keledek Ungu Jepun',
        'Menyokong pertumbuhan bakteria baik mikrobiom usus',
        '100% Halal, Tanpa Gula Tambahan & Bebas Laktosa',
      ],
      ingredients: 'Serbuk Ubi Keledek Ungu Organik, Serat Inulin Prebiotik, Serbuk Beras Perang, Santan Kelapa Tulen, Stevia Semulajadi.',
      usage: 'Bancuh 1 paket (20g) dengan 150ml - 180ml air suam atau sejuk. Kacau rata dan sedia diminum setiap pagi sebelum sarapan.',
      nutrition: [
        { label: 'Tenaga', val: '78 kcal' },
        { label: 'Serat Diet', val: '10.4g' },
        { label: 'Karbohidrat', val: '6.2g' },
        { label: 'Gula Tambahan', val: '0g' },
        { label: 'Protein', val: '1.2g' },
      ],
    },
    'asianmum-avocado-moringa': {
      name: 'Asian Mum Prebiotik Avokado & Moringa Superfood (15 Paket x 20g)',
      category: 'Superfood Avokado',
      tag: '🥑 Dopamine Lime',
      retailPrice: 62.00,
      dealerPrice: 45.00,
      bv: 38.00,
      pv: 22.00,
      imageUrl: '/images/products/avocado-moringa.jpg',
      tagClass: 'tag-dopamine-green',
      highlights: [
        'Kaya Vitamin E & Selenium untuk perlindungan sel dari stres oksidatif',
        'Ekstrak Daun Moringa organik membekalkan klorofil & zat besi',
        'Membantu metabolisme lemak dan tenaga sepanjang hari',
        'Tekstur berkrim lembut enak tanpa rasa pahit',
      ],
      ingredients: 'Ekstrak Buah Avokado Segar, Serbuk Daun Moringa Organik, Serat Prebiotik Chicory Root Inulin, Serbuk Oat Halus.',
      usage: 'Campurkan 1 paket ke dalam 180ml air suam atau goncang dengan susu oat/soya sejuk sebagai smoothie berkhasiat.',
      nutrition: [
        { label: 'Tenaga', val: '84 kcal' },
        { label: 'Serat Diet', val: '9.8g' },
        { label: 'Lemak Sihat', val: '2.4g' },
        { label: 'Vitamin E', val: '4.5mg' },
        { label: 'Gula Tambahan', val: '0g' },
      ],
    },
    'asianmum-beaufica-cranberry': {
      name: 'Asian Mum Beaufica Kranberi & Kacip Fatimah (20 Sachet x 3g)',
      category: 'Kesihatan Wanita & Botani',
      tag: '🌸 Dopamine Coral',
      retailPrice: 78.00,
      dealerPrice: 55.00,
      bv: 48.00,
      pv: 28.00,
      imageUrl: '/images/products/beaufica-cranberry.jpg',
      tagClass: 'tag-dopamine-coral',
      highlights: [
        'Ekstrak Kacip Fatimah (Labisia pumila) gred premium untuk kesihatan dalaman wanita',
        'Serbuk Kranberi Liar mengurangkan risiko jangkitan saluran kencing (UTI)',
        'Ekstrak Delima & Kolagen Tumbuhan untuk kulit anjal & glowing',
        'Bungkusan sachet langsing mudah koyak dan diminum terus',
      ],
      ingredients: 'Serbuk Pati Kranberi Asli, Ekstrak Kacip Fatimah Tulen, Ekstrak Delima, Vitamin C (Asid Askorbik), Kolagen Botani, Stevia.',
      usage: 'Koyak sachet dan tuang terus ke dalam mulut atau larutkan ke dalam 50ml air sejuk. Ambil 1 sachet setiap hari selepas makan.',
      nutrition: [
        { label: 'Tenaga', val: '12 kcal' },
        { label: 'Vitamin C', val: '100mg' },
        { label: 'Polifenol', val: '250mg' },
        { label: 'Gula Tambahan', val: '0g' },
      ],
    },
  },
  en: {
    'asianmum-purple-sweet-potato': {
      name: 'Asian Mum Purple Sweet Potato Prebiotic (15 Sachets x 20g)',
      category: 'Prebiotic Drinks',
      tag: '💜 Dopamine Violet',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      pv: 20.00,
      imageUrl: '/images/products/purple-sweet-potato.jpg',
      tagClass: 'tag-dopamine-purple',
      highlights: [
        '10.4g Prebiotic Inulin dietary fibre per serving',
        'Rich in Japanese Purple Sweet Potato Anthocyanins',
        'Nourishes healthy gut microbiome flora',
        '100% Halal, Zero Added Sugar & Lactose-Free',
      ],
      ingredients: 'Organic Purple Sweet Yam Powder, Prebiotic Chicory Root Inulin, Brown Rice Powder, Pure Coconut Cream, Natural Stevia.',
      usage: 'Mix 1 sachet (20g) into 150ml - 180ml warm or cold water. Stir well and consume every morning before breakfast.',
      nutrition: [
        { label: 'Energy', val: '78 kcal' },
        { label: 'Dietary Fibre', val: '10.4g' },
        { label: 'Carbohydrates', val: '6.2g' },
        { label: 'Added Sugar', val: '0g' },
        { label: 'Protein', val: '1.2g' },
      ],
    },
    'asianmum-avocado-moringa': {
      name: 'Asian Mum Avocado & Moringa Superfood Prebiotic (15 Sachets x 20g)',
      category: 'Avocado Superfood',
      tag: '🥑 Dopamine Lime',
      retailPrice: 62.00,
      dealerPrice: 45.00,
      bv: 38.00,
      pv: 22.00,
      imageUrl: '/images/products/avocado-moringa.jpg',
      tagClass: 'tag-dopamine-green',
      highlights: [
        'Packed with Vitamin E & Selenium for cellular antioxidant defense',
        'Organic Moringa Leaf Powder providing natural chlorophyll and iron',
        'Supports sustained vitality and healthy lipid metabolism',
        'Delicious silky smoothie texture with natural goodness',
      ],
      ingredients: 'Fresh Avocado Extract, Organic Moringa Leaf, Chicory Inulin Prebiotics, Fine Oat Flour.',
      usage: 'Blend 1 sachet into 180ml warm water or shake with cold oat/soy milk as a power smoothie.',
      nutrition: [
        { label: 'Energy', val: '84 kcal' },
        { label: 'Dietary Fibre', val: '9.8g' },
        { label: 'Healthy Fats', val: '2.4g' },
        { label: 'Vitamin E', val: '4.5mg' },
        { label: 'Added Sugar', val: '0g' },
      ],
    },
    'asianmum-beaufica-cranberry': {
      name: 'Asian Mum Beaufica Cranberry & Kacip Fatimah (20 Sachets x 3g)',
      category: 'Women’s Wellness & Botanicals',
      tag: '🌸 Dopamine Coral',
      retailPrice: 78.00,
      dealerPrice: 55.00,
      bv: 48.00,
      pv: 28.00,
      imageUrl: '/images/products/beaufica-cranberry.jpg',
      tagClass: 'tag-dopamine-coral',
      highlights: [
        'Pure Kacip Fatimah extract to balance female hormonal rhythm',
        'Wild Cranberry extract prevents urinary tract discomfort (UTI)',
        'Ruby Pomegranate & Plant Collagen for firm glowing skin',
        'Ultra-slim ready-to-drink portable sachet',
      ],
      ingredients: 'Wild Cranberry Juice Powder, Pure Kacip Fatimah Extract, Pomegranate Extract, Vitamin C, Plant Collagen, Stevia.',
      usage: 'Tear and consume directly into mouth or dissolve into 50ml cold water. Take 1 sachet daily after meals.',
      nutrition: [
        { label: 'Energy', val: '12 kcal' },
        { label: 'Vitamin C', val: '100mg' },
        { label: 'Polyphenols', val: '250mg' },
        { label: 'Added Sugar', val: '0g' },
      ],
    },
  },
  cn: {
    'asianmum-purple-sweet-potato': {
      name: 'Asian Mum 紫薯益生元高纤饮 (15包 x 20g)',
      category: '益生元高纤饮',
      tag: '💜 多巴胺梦幻紫',
      retailPrice: 58.00,
      dealerPrice: 42.00,
      bv: 35.00,
      pv: 20.00,
      imageUrl: '/images/products/purple-sweet-potato.jpg',
      tagClass: 'tag-dopamine-purple',
      highlights: [
        '每份含 10.4g 益生元天然菊粉膳食纤维',
        '富含日本紫甘薯天然花青素强效抗氧化物',
        '促进肠道有益菌繁殖，维持微生态平衡',
        '100% 清真认证、零添加蔗糖、无乳糖配方',
      ],
      ingredients: '有机紫甘薯粉、益生元菊粉纤维、糙米胚芽粉、纯椰子粉、天然甜叶菊苷。',
      usage: '取 1 包 (20g) 加入 150ml - 180ml 温水或凉水中，搅拌均匀即可饮用，建议每日早晨空腹饮用。',
      nutrition: [
        { label: '能量', val: '78 千卡' },
        { label: '膳食纤维', val: '10.4克' },
        { label: '碳水化合物', val: '6.2克' },
        { label: '添加蔗糖', val: '0克' },
        { label: '蛋白质', val: '1.2克' },
      ],
    },
    'asianmum-avocado-moringa': {
      name: 'Asian Mum 牛油果辣木超级食物益生元饮 (15包 x 20g)',
      category: '牛油果超级食物',
      tag: '🥑 多巴胺牛油果绿',
      retailPrice: 62.00,
      dealerPrice: 45.00,
      bv: 38.00,
      pv: 22.00,
      imageUrl: '/images/products/avocado-moringa.jpg',
      tagClass: 'tag-dopamine-green',
      highlights: [
        '富含维生素 E 与微量元素硒，全方位保护细胞抗氧化',
        '精选有机辣木叶粉，提供天然叶绿素与植物铁质',
        '促进脂肪健康代谢，全天候补充活力',
        '口感细腻丝滑醇香，完全无苦涩感',
      ],
      ingredients: '新鲜牛油果萃取粉、有机辣木叶粉、菊苣根益生元菊粉、超细全燕麦粉。',
      usage: '取 1 包冲泡于 180ml 温水，或与冷燕麦奶/豆奶摇匀作为活力奶昔饮用。',
      nutrition: [
        { label: '能量', val: '84 千卡' },
        { label: '膳食纤维', val: '9.8克' },
        { label: '健康植物油脂', val: '2.4克' },
        { label: '维生素 E', val: '4.5毫克' },
        { label: '添加蔗糖', val: '0克' },
      ],
    },
    'asianmum-beaufica-cranberry': {
      name: 'Asian Mum Beaufica 蔓越莓卡琪花蒂玛植物饮 (20条 x 3g)',
      category: '女性草本调理',
      tag: '🌸 多巴胺珊瑚粉',
      retailPrice: 78.00,
      dealerPrice: 55.00,
      bv: 48.00,
      pv: 28.00,
      imageUrl: '/images/products/beaufica-cranberry.jpg',
      tagClass: 'tag-dopamine-coral',
      highlights: [
        '特级纯正卡琪花蒂玛萃取，温和平衡女性内分泌与雌激素',
        '高浓缩野生蔓越莓精华，显著预防泌尿私密系统不适 (UTI)',
        '红石榴多酚与植物胶原蛋白，紧致抗老，由内而外提亮肤色',
        '便携独立小条装，开封即食或随时冲饮',
      ],
      ingredients: '野生蔓越莓原浆粉、纯正卡琪花蒂玛提取物、红石榴萃取、维生素 C、植物胶原蛋白、甜菊糖苷。',
      usage: '撕开包装直接倒入口中，或溶解于 50ml 凉水中饮用。建议每日餐后 1 条。',
      nutrition: [
        { label: '能量', val: '12 千卡' },
        { label: '维生素 C', val: '100毫克' },
        { label: '天然多酚', val: '250毫克' },
        { label: '添加蔗糖', val: '0克' },
      ],
    },
  },
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const { user } = useAuth()
  const { lang, t } = useLanguage()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'nutrition'>('info')

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.get(slug!),
    enabled: !!slug,
  })

  const langMap = MOCK_DETAILS_BY_LANG[lang] || MOCK_DETAILS_BY_LANG.bm
  const fallbackKey = (slug || 'asianmum-purple-sweet-potato') as keyof typeof langMap
  const fallback = langMap[fallbackKey] || langMap['asianmum-purple-sweet-potato']

  const addToCart = useMutation({
    mutationFn: () => {
      const v = product?.variants?.[0]
      if (!v) throw new Error('No variant selected')
      return ordersApi.addToCart(v.id, qty)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse pt-4">
        <div className="aspect-square rounded-3xl bg-emerald-100/50" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-xl bg-emerald-100/50" />
          <div className="h-4 w-full rounded-xl bg-emerald-100/50" />
          <div className="h-4 w-2/3 rounded-xl bg-emerald-100/50" />
        </div>
      </div>
    )
  }

  const displayTitle = product?.name || fallback.name
  const displayCategory = product?.category || fallback.category
  const displayImage = product?.imageUrl || product?.images?.[0] || fallback.imageUrl
  const displayRetail = product?.variants?.[0]?.priceRM || fallback.retailPrice
  const displayDealer = product?.variants?.[0]?.dealerPrice || fallback.dealerPrice
  const displayBV = product?.variants?.[0]?.bv || fallback.bv
  const displayPV = product?.variants?.[0]?.pv || fallback.pv

  return (
    <div className="space-y-6 pt-2 pb-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
        <Link to="/shop" className="flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> {t.productDetail.backToShop}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 truncate max-w-xs">{displayTitle}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Product Image Section */}
        <div className="md:col-span-5">
          <div className="sticky top-24 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-emerald-900/10 shadow-lg p-4">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-contain"
              />
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${fallback.tagClass}`}>
                {fallback.tag}
              </span>
              <span className="absolute bottom-4 right-4 bg-emerald-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> {t.productDetail.halalCert}
              </span>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-700 bg-white p-3 rounded-2xl border border-emerald-900/10 shadow-2xs">
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">🌱</span>
                <span>{t.brand.plantBased}</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-gray-100">
                <span className="text-base">🚫</span>
                <span>{t.brand.noSugar}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">🚚</span>
                <span>Express Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:col-span-7 space-y-6">
          
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {displayCategory}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 leading-snug">
              {displayTitle}
            </h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>{t.productDetail.brand}: <strong>Asian Mum</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{t.productDetail.inStock}</span>
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-amber-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-900/10 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-xs text-gray-500 block">{t.dopamine.customerPrice}</span>
                <span className="text-3xl font-black text-gray-900">RM {displayRetail.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-800 font-bold block">{t.dopamine.dealerPrice}</span>
                <span className="text-lg font-black text-emerald-800">RM {displayDealer.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-emerald-900/10 text-xs">
              <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-700 text-white">
                {t.productDetail.bvLabel} {displayBV.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold bg-amber-600 text-white">
                {t.productDetail.pvLabel} {displayPV.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t.productDetail.benefitsTitle}</p>
            <div className="space-y-1.5">
              {fallback.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">{t.productDetail.quantity}</span>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-emerald-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-gray-900 text-sm bg-white py-2">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 border-t pt-3">
              <span>{t.productDetail.totalAmount}</span>
              <strong className="text-lg font-black text-gray-900">RM {(displayRetail * qty).toFixed(2)}</strong>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { returnTo: location.pathname } })
                  return
                }
                if (product?.variants?.[0]?.id) {
                  addToCart.mutate()
                } else {
                  setAdded(true)
                  setTimeout(() => setAdded(false), 2500)
                }
              }}
              className="w-full btn-primary py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              {!user ? (
                <><LogIn className="h-4 w-4" /> {t.productDetail.loginToBuy}</>
              ) : added ? (
                <><Check className="h-4 w-4" /> {t.productDetail.addedToCart}</>
              ) : (
                <><ShoppingCart className="h-4 w-4" /> {t.productDetail.addToCart}</>
              )}
            </button>
          </div>

          {/* Tabs for detailed info */}
          <div className="bg-white rounded-2xl border border-emerald-900/10 overflow-hidden shadow-xs">
            <div className="flex border-b text-xs font-bold">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  activeTab === 'info' ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50' : 'border-transparent text-gray-500'
                }`}
              >
                {t.productDetail.howToConsume}
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  activeTab === 'ingredients' ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50' : 'border-transparent text-gray-500'
                }`}
              >
                {t.productDetail.ingredients}
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  activeTab === 'nutrition' ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50' : 'border-transparent text-gray-500'
                }`}
              >
                {t.productDetail.nutritionFacts}
              </button>
            </div>

            <div className="p-5 text-xs text-gray-700 leading-relaxed">
              {activeTab === 'info' && (
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">{t.productDetail.howToConsume}:</p>
                  <p>{fallback.usage}</p>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">{t.productDetail.ingredients}:</p>
                  <p>{fallback.ingredients}</p>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="space-y-2">
                  <p className="font-bold text-gray-900 mb-2">{t.productDetail.nutritionFacts}:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {fallback.nutrition.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-2.5 rounded-xl flex justify-between border border-gray-100">
                        <span className="text-gray-500">{item.label}</span>
                        <strong className="text-gray-900">{item.val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
