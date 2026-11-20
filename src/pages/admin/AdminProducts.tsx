import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import type { AdminProduct, AdminProductVariant, ProductStatus } from '../../types'
import RichTextEditor from '../../components/RichTextEditor'
import {
  Search, Plus, Trash2, Loader2, X, Pencil, ImagePlus,
  ChevronDown, ChevronUp, PackagePlus, Save,
  Star, Archive, FileEdit, Eye, Globe, Tag
} from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 } as const
const th = 'pb-3 pr-3 text-left text-xs font-bold tracking-widest uppercase text-gray-600'
const td = 'py-3 pr-3 text-sm'

const STATUS_STYLES: Record<ProductStatus, { bg: string; color: string; border: string; label: string }> = {
  published: { bg: 'rgba(34,197,94,0.1)',    color: '#4ade80', border: 'rgba(34,197,94,0.2)',    label: 'Published' },
  draft:     { bg: 'rgba(107,114,128,0.1)',  color: '#9ca3af', border: 'rgba(107,114,128,0.2)', label: 'Draft' },
  archived:  { bg: 'rgba(239,68,68,0.1)',    color: '#f87171', border: 'rgba(239,68,68,0.2)',    label: 'Archived' },
}

function parseJsonArr(s: string): string[] {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}
function priceRange(variants: AdminProductVariant[]) {
  if (!variants?.length) return '—'
  const prices = variants.map(v => v.retailPrice).filter(p => p > 0)
  if (!prices.length) return '—'
  const min = Math.min(...prices), max = Math.max(...prices)
  return min === max ? `RM ${min.toFixed(2)}` : `RM ${min.toFixed(2)} – ${max.toFixed(2)}`
}
function totalStock(variants: AdminProductVariant[]) {
  return variants?.reduce((s, v) => s + v.stockOnHand, 0) ?? 0
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'products', search, statusFilter, page],
    queryFn: () => productsApi.adminList({ search, page, status: statusFilter || undefined }),
  })

  const del = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const STATUS_TABS: { value: ProductStatus | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-xs text-gray-600 mt-0.5">Manage catalogue, variants, images and pricing</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-black"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          <Plus className="h-4 w-4" /> New Product
        </button>
      </div>

      <div style={card}>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input className="dark-input w-full" style={{ paddingLeft: 40 }} placeholder="Search products, SKU..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STATUS_TABS.map((t) => (
              <button key={t.value} onClick={() => { setStatusFilter(t.value); setPage(1) }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={statusFilter === t.value
                  ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
                  : { color: '#6b7280' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
          </div>
        )}
        {isError && <div className="py-10 text-center text-red-400 text-sm">Failed to load products.</div>}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th} style={{ width: 56 }}>Image</th>
                  <th className={th}>Product / SKU</th>
                  <th className={th}>Category</th>
                  <th className={th}>Prices</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Status</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-700 text-sm">No products found</td></tr>
                )}
                {data?.items?.map((product) => {
                  const st = STATUS_STYLES[product.status] ?? STATUS_STYLES.draft
                  const mainImg = product.imageUrl || parseJsonArr(product.imageUrls)[0]
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="py-3 pr-3">
                        {mainImg ? (
                          <img src={mainImg} alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <ImagePlus className="h-4 w-4 text-gray-700" />
                          </div>
                        )}
                      </td>
                      <td className={td}>
                        <div className="font-semibold text-white leading-tight">{product.name}</div>
                        {product.nameZh && <div className="text-xs text-gray-500 mt-0.5">{product.nameZh}</div>}
                        <div className="text-xs text-gray-700 font-mono mt-0.5">{product.sku}</div>
                      </td>
                      <td className={td}>
                        <div className="text-xs text-gray-500">{product.category || '—'}</div>
                        {product.brand && <div className="text-xs text-gray-700">{product.brand}</div>}
                      </td>
                      <td className={td}>
                        <div className="text-xs font-semibold" style={{ color: GOLD }}>{priceRange(product.variants)}</div>
                        <div className="text-xs text-gray-700 mt-0.5">{product.variants?.length ?? 0} variant{product.variants?.length !== 1 ? 's' : ''}</div>
                      </td>
                      <td className={td}>
                        <span className="font-bold" style={{ color: totalStock(product.variants) === 0 ? '#f87171' : totalStock(product.variants) <= 20 ? '#fbbf24' : '#4ade80' }}>
                          {totalStock(product.variants)}
                        </span>
                        <div className="text-xs text-gray-700">units</div>
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full w-fit"
                          style={{ background: st.bg, border: `1px solid ${st.border}` }}>
                          <span className="text-xs font-bold" style={{ color: st.color }}>{st.label}</span>
                        </div>
                        {product.isFeatured && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3" style={{ color: GOLD }} />
                            <span className="text-xs" style={{ color: GOLD }}>Featured</span>
                          </div>
                        )}
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditing(product)} className="text-gray-600 hover:text-yellow-400 transition-colors" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => { if (confirm(`Delete "${product.name}"?`)) del.mutate(product.id) }}
                            className="text-gray-700 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
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

        {data && (
          <div className="flex items-center justify-between mt-5 pt-5 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-gray-600">Total: <strong className="text-white">{data?.total ?? 0}</strong> products</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>← Prev</button>
              <button disabled={!data?.items?.length || data.items.length < (data?.pageSize ?? 20)} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <ProductEditorModal onClose={() => setShowCreate(false)} />}
      {editing && <ProductEditorModal product={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

// ── Product Editor Modal ──────────────────────────────────────────────────────

function ProductEditorModal({ product, onClose }: { product?: AdminProduct; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [nameZh, setNameZh] = useState(product?.nameZh ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [brand, setBrand] = useState(product?.brand ?? 'AsianMum')
  const [tags, setTags] = useState(parseJsonArr(product?.tags ?? '').join(', '))
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft')
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [sortOrder, setSortOrder] = useState(String(product?.sortOrder ?? 0))

  const mainImgRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [mainImgPreview, setMainImgPreview] = useState(product?.imageUrl ?? '')
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(parseJsonArr(product?.imageUrls ?? ''))

  const [variants, setVariants] = useState<AdminProductVariant[]>(product?.variants ?? [])
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null)

  // Draft variants (create mode only) — submitted after product is saved
  type DraftVariant = { _id: string; name: string; sku: string; retailPrice: string; dealerPrice: string; bv: string; pv: string; weight: string; stock: string; isActive: boolean }
  const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([])
  const [showDraftForm, setShowDraftForm] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftSku, setDraftSku] = useState('')
  const [draftPrice, setDraftPrice] = useState('')
  const [draftDealerPrice, setDraftDealerPrice] = useState('')
  const [draftBv, setDraftBv] = useState('')
  const [draftPv, setDraftPv] = useState('')
  const [draftWeight, setDraftWeight] = useState('')
  const [draftStock, setDraftStock] = useState('0')
  const [draftActive, setDraftActive] = useState(true)

  function addDraftVariant() {
    if (!draftName.trim() || !draftSku.trim()) return
    setDraftVariants(prev => [...prev, {
      _id: Math.random().toString(36).slice(2),
      name: draftName, sku: draftSku, retailPrice: draftPrice,
      dealerPrice: draftDealerPrice, bv: draftBv, pv: draftPv, weight: draftWeight, stock: draftStock, isActive: draftActive,
    }])
    setDraftName(''); setDraftSku(''); setDraftPrice(''); setDraftDealerPrice(''); setDraftBv(''); setDraftPv(''); setDraftWeight(''); setDraftStock('0'); setDraftActive(true)
    setShowDraftForm(false)
  }

  const save = useMutation({
    mutationFn: async () => {
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)
      const payload: Partial<AdminProduct> = {
        name, nameZh, sku, description, category, brand,
        tags: JSON.stringify(tagArr),
        status, isFeatured,
        sortOrder: parseInt(sortOrder) || 0,
      }
      let saved: AdminProduct
      if (isEdit) {
        saved = await productsApi.update(product.id, payload)
      } else {
        saved = await productsApi.create(payload)
        // Create all draft variants after product is created
        for (const dv of draftVariants) {
          await productsApi.createVariant(saved.id, {
            name: dv.name, sku: dv.sku,
            retailPrice: parseFloat(dv.retailPrice) || 0,
            dealerPrice: parseFloat(dv.dealerPrice) || 0,
            bv: parseFloat(dv.bv) || 0,
            pv: parseFloat(dv.pv) || 0,
            weight: parseFloat(dv.weight) || 0,
            stockOnHand: parseInt(dv.stock) || 0,
            isActive: dv.isActive,
          })
        }
      }
      if (mainImgRef.current?.files?.[0]) {
        await productsApi.uploadImage(saved.id, mainImgRef.current.files[0])
      }
      return saved
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); onClose() },
  })

  const delVariant = useMutation({
    mutationFn: (vid: string) => productsApi.deleteVariant(product!.id, vid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const STATUSES: { value: ProductStatus; icon: React.ReactNode }[] = [
    { value: 'draft', icon: <FileEdit className="h-3 w-3" /> },
    { value: 'published', icon: <Eye className="h-3 w-3" /> },
    { value: 'archived', icon: <Archive className="h-3 w-3" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-6 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-3xl mb-6" style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, overflow: 'hidden' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5"
          style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-lg font-black text-white">{isEdit ? 'Edit Product' : 'New Product'}</h2>
            {isEdit && <p className="text-xs text-gray-600 mt-0.5">SKU: {product.sku}</p>}
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-8 py-6 space-y-8">

          {/* ── Basic Info ── */}
          <section>
            <SectionHeading icon={<Globe className="h-3.5 w-3.5" />} label="Product Info" />
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="sm:col-span-2">
                <Label>Name (English) *</Label>
                <input className="dark-input mt-1" value={name} placeholder="hoPme Premium Cat Litter" onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label>Name (中文)</Label>
                <input className="dark-input mt-1" value={nameZh} placeholder="高端猫砂" onChange={e => setNameZh(e.target.value)} />
              </div>
              <div>
                <Label>SKU / Product Code{!isEdit && ' *'}</Label>
                <input className="dark-input mt-1 font-mono" value={sku} placeholder="HOP-LITTER-001" onChange={e => setSku(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <input className="dark-input mt-1" value={category} placeholder="Cat Litter" onChange={e => setCategory(e.target.value)} />
              </div>
              <div>
                <Label>Brand</Label>
                <input className="dark-input mt-1" value={brand} placeholder="AsianMum" onChange={e => setBrand(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your product — features, benefits, usage instructions..."
                  minHeight={180}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Tags (comma-separated)</Label>
                <input className="dark-input mt-1" value={tags} placeholder="tofu, lavender, natural" onChange={e => setTags(e.target.value)} />
              </div>
            </div>
          </section>

          {/* ── Images ── */}
          <section>
            <SectionHeading icon={<ImagePlus className="h-3.5 w-3.5" />} label="Product Images" />
            <div className="mt-4 grid sm:grid-cols-2 gap-5">
              <div>
                <Label>Main Image</Label>
                <div className="mt-2 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(233,30,140,0.18)', aspectRatio: '1', maxHeight: 200 }}
                  onClick={() => mainImgRef.current?.click()}>
                  {mainImgPreview ? (
                    <img src={mainImgPreview} alt="main" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center py-8">
                      <ImagePlus className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Click to upload</p>
                    </div>
                  )}
                </div>
                <input ref={mainImgRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setMainImgPreview(URL.createObjectURL(f)) }} />
              </div>
              <div>
                <Label>Gallery Images</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {galleryPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={src} alt={`g-${i}`} className="w-full h-full object-cover" />
                      <button onClick={() => setGalleryPreviews(p => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {isEdit && (
                    <button onClick={() => galleryRef.current?.click()}
                      className="aspect-square rounded-xl flex items-center justify-center"
                      style={{ border: '2px dashed rgba(233,30,140,0.18)', color: '#6b7280' }}>
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {!isEdit && <p className="text-xs text-gray-700 mt-2">Gallery images available after creation.</p>}
                <input ref={galleryRef} type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (f && product) {
                      setGalleryPreviews(p => [...p, URL.createObjectURL(f)])
                      await productsApi.uploadImage(product.id, f)
                      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
                    }
                  }} />
              </div>
            </div>
          </section>

          {/* ── Status & Visibility ── */}
          <section>
            <SectionHeading icon={<Tag className="h-3.5 w-3.5" />} label="Status & Visibility" />
            <div className="mt-4 grid sm:grid-cols-2 gap-5">
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-2">
                  {STATUSES.map(({ value: s, icon }) => {
                    const st = STATUS_STYLES[s]
                    return (
                      <button key={s} onClick={() => setStatus(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={status === s
                          ? { background: st.bg, color: st.color, border: `1.5px solid ${st.border}` }
                          : { color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {icon} {st.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 sm:mt-5">
                <Toggle label="Featured" on={isFeatured} onToggle={() => setIsFeatured(f => !f)} activeColor={ROSE} activeTextColor={GOLD} />
              </div>
              <div>
                <Label>Sort Order</Label>
                <input className="dark-input mt-1" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
              </div>
            </div>
          </section>

          {/* ── Variants (edit only) ── */}
          {isEdit ? (
            <section>
              <div className="flex items-center justify-between">
                <SectionHeading icon={<PackagePlus className="h-3.5 w-3.5" />} label={`Variants (${variants.length})`} />
                <button onClick={() => setShowAddVariant(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                  style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                  <PackagePlus className="h-3.5 w-3.5" /> Add Variant
                </button>
              </div>

              {showAddVariant && (
                <div className="mt-3">
                  <AddVariantForm productId={product.id}
                    onDone={() => { setShowAddVariant(false); qc.invalidateQueries({ queryKey: ['admin', 'products'] }) }}
                    onAdded={(v) => setVariants(p => [...p, v])} />
                </div>
              )}

              <div className="mt-3 space-y-2">
                {!variants.length && <p className="text-sm text-gray-700 py-4">No variants yet. Add one above.</p>}
                {variants.map((v) => (
                  <div key={v.id} className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      {v.imageUrl ? (
                        <img src={v.imageUrl} alt={v.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <ImagePlus className="h-3.5 w-3.5 text-gray-700" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{v.name}</span>
                          {!v.isActive && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Inactive</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-600 font-mono">{v.sku}</span>
                          <span className="text-xs font-bold" style={{ color: GOLD }}>RM {v.retailPrice.toFixed(2)}</span>
                          {v.dealerPrice > 0 && <span className="text-xs text-gray-600">Consultant: RM {v.dealerPrice.toFixed(2)}</span>}
                          <span className="text-xs font-semibold"
                            style={{ color: v.stockOnHand <= v.lowStockAlert ? '#f87171' : '#4ade80' }}>
                            Stock: {v.stockOnHand}
                          </span>
                          {v.weight > 0 && <span className="text-xs text-gray-600">{v.weight}kg</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setExpandedVariant(expandedVariant === v.id ? null : v.id)}
                          className="text-gray-600 hover:text-white transition-colors">
                          {expandedVariant === v.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button onClick={() => {
                          if (confirm('Delete this variant?')) {
                            delVariant.mutate(v.id)
                            setVariants(p => p.filter(x => x.id !== v.id))
                          }
                        }} className="text-gray-700 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {expandedVariant === v.id && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <EditVariantForm productId={product.id} variant={v}
                          onDone={(updated) => {
                            setVariants(prev => prev.map(x => x.id === v.id ? { ...x, ...updated } : x))
                            setExpandedVariant(null)
                            qc.invalidateQueries({ queryKey: ['admin', 'products'] })
                          }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div className="flex items-center justify-between">
                <SectionHeading icon={<PackagePlus className="h-3.5 w-3.5" />} label={`Variants (${draftVariants.length})`} />
                <button onClick={() => setShowDraftForm(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                  style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                  <PackagePlus className="h-3.5 w-3.5" /> Add Variant
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">Variants will be created automatically when you save the product.</p>

              {showDraftForm && (
                <div className="mt-3 p-4 rounded-xl space-y-3" style={{ background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                  <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>New Variant</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Name *</Label>
                      <input className="dark-input mt-1" placeholder="Original 2.5kg" value={draftName} onChange={e => setDraftName(e.target.value)} />
                    </div>
                    <div>
                      <Label>SKU *</Label>
                      <input className="dark-input mt-1 font-mono" placeholder="HOP-001" value={draftSku} onChange={e => setDraftSku(e.target.value)} />
                    </div>
                    <div>
                      <Label>Retail Price (RM)</Label>
                      <input className="dark-input mt-1" type="number" step="0.01" placeholder="28.00" value={draftPrice} onChange={e => setDraftPrice(e.target.value)} />
                    </div>
                    <div>
                      <Label>Consultant Price (RM)</Label>
                      <input className="dark-input mt-1" type="number" step="0.01" placeholder="22.00" value={draftDealerPrice} onChange={e => setDraftDealerPrice(e.target.value)} />
                    </div>
                    <div>
                      <Label>BV</Label>
                      <input className="dark-input mt-1" type="number" step="0.01" placeholder="22.00" value={draftBv} onChange={e => setDraftBv(e.target.value)} />
                    </div>
                    <div>
                      <Label>PV</Label>
                      <input className="dark-input mt-1" type="number" step="0.01" placeholder="22.00" value={draftPv} onChange={e => setDraftPv(e.target.value)} />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <input className="dark-input mt-1" type="number" step="0.01" placeholder="2.5" value={draftWeight} onChange={e => setDraftWeight(e.target.value)} />
                    </div>
                    <div>
                      <Label>Stock</Label>
                      <input className="dark-input mt-1" type="number" placeholder="0" value={draftStock} onChange={e => setDraftStock(e.target.value)} />
                    </div>
                  </div>
                  <Toggle label="Active" on={draftActive} onToggle={() => setDraftActive(a => !a)} activeColor="#16a34a" activeTextColor="#4ade80" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowDraftForm(false)} className="px-3 py-1.5 text-xs text-gray-500 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                    <button disabled={!draftName.trim() || !draftSku.trim()} onClick={addDraftVariant}
                      className="px-4 py-1.5 text-xs font-black text-black rounded-lg disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                      Add Variant
                    </button>
                  </div>
                </div>
              )}

              {draftVariants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {draftVariants.map((dv) => (
                    <div key={dv._id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{dv.name}</span>
                          <span className="text-xs font-mono text-gray-600">{dv.sku}</span>
                          {!dv.isActive && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Inactive</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {dv.retailPrice && <span className="text-xs font-bold" style={{ color: GOLD }}>RM {parseFloat(dv.retailPrice).toFixed(2)}</span>}
                          {dv.weight && <span className="text-xs text-gray-600">{dv.weight}kg</span>}
                          <span className="text-xs text-gray-600">Stock: {dv.stock}</span>
                        </div>
                      </div>
                      <button onClick={() => setDraftVariants(p => p.filter(x => x._id !== dv._id))}
                        className="text-gray-700 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center gap-3 px-8 py-5"
          style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {save.isError && <span className="text-sm text-red-400 mr-auto">Failed to save: {(save.error as any)?.response?.data?.error || save.error?.message || 'Check required fields.'}</span>}
          {!save.isError && <span className="flex-1" />}
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button disabled={save.isPending || !name.trim()} onClick={() => save.mutate()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            <Save className="h-4 w-4" />
            {save.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Variant Form ──────────────────────────────────────────────────────────

function AddVariantForm({ productId, onDone, onAdded }: {
  productId: string; onDone: () => void; onAdded?: (v: AdminProductVariant) => void
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [dealerPrice, setDealerPrice] = useState('')
  const [bv, setBv] = useState('')
  const [pv, setPv] = useState('')
  const [weight, setWeight] = useState('')
  const [stock, setStock] = useState('0')
  const [lowStockAlert, setLowStockAlert] = useState('10')
  const [attributes, setAttributes] = useState('')
  const [isActive, setIsActive] = useState(true)
  const imgRef = useRef<HTMLInputElement>(null)
  const [imgPreview, setImgPreview] = useState('')

  const add = useMutation({
    mutationFn: async () => {
      const attrObj: Record<string, string> = {}
      attributes.split(',').forEach(pair => {
        const [k, v] = pair.split('=').map(s => s.trim())
        if (k && v) attrObj[k] = v
      })
      const created = await productsApi.createVariant(productId, {
        name, sku,
        retailPrice: parseFloat(retailPrice) || 0,
        dealerPrice: parseFloat(dealerPrice) || 0,
        bv: parseFloat(bv) || 0,
        pv: parseFloat(pv) || 0,
        weight: parseFloat(weight) || 0,
        stockOnHand: parseInt(stock) || 0,
        lowStockAlert: parseInt(lowStockAlert) || 10,
        attributes: JSON.stringify(attrObj),
        isActive,
      }) as AdminProductVariant
      // Upload variant image if selected
      const file = imgRef.current?.files?.[0]
      if (file && created?.id) {
        await productsApi.uploadImage(productId, file, created.id)
      }
      return created
    },
    onSuccess: (v) => { onAdded?.(v); onDone() },
  })

  return (
    <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(233,30,140,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>New Variant</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label>Name *</Label>
          <input className="dark-input mt-1" placeholder="Original 2.5kg" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <Label>SKU *</Label>
          <input className="dark-input mt-1 font-mono" placeholder="HOP-001" value={sku} onChange={e => setSku(e.target.value)} />
        </div>
        <div>
          <Label>Retail Price (RM) *</Label>
          <input className="dark-input mt-1" type="number" step="0.01" placeholder="28.00" value={retailPrice} onChange={e => setRetailPrice(e.target.value)} />
        </div>
        <div>
          <Label>Consultant Price (RM)</Label>
          <input className="dark-input mt-1" type="number" step="0.01" placeholder="22.00" value={dealerPrice} onChange={e => setDealerPrice(e.target.value)} />
        </div>
        <div>
          <Label>BV</Label>
          <input className="dark-input mt-1" type="number" step="0.01" placeholder="22.00" value={bv} onChange={e => setBv(e.target.value)} />
        </div>
        <div>
          <Label>PV</Label>
          <input className="dark-input mt-1" type="number" step="0.01" placeholder="22.00" value={pv} onChange={e => setPv(e.target.value)} />
        </div>
        <div>
          <Label>Weight (kg)</Label>
          <input className="dark-input mt-1" type="number" step="0.01" placeholder="2.5" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <Label>Initial Stock</Label>
          <input className="dark-input mt-1" type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
        </div>
        <div>
          <Label>Low Stock Alert</Label>
          <input className="dark-input mt-1" type="number" placeholder="10" value={lowStockAlert} onChange={e => setLowStockAlert(e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Label>Attributes (key=value, comma separated)</Label>
          <input className="dark-input mt-1" placeholder="size=2.5kg, scent=lavender, type=tofu" value={attributes} onChange={e => setAttributes(e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <Label>Variant Image</Label>
          <div className="flex items-center gap-3 mt-1">
            {imgPreview ? (
              <img src={imgPreview} alt="preview" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ImagePlus className="h-4 w-4 text-gray-700" />
              </div>
            )}
            <input ref={imgRef} type="file" accept="image/*"
              className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-900 file:text-yellow-200"
              onChange={e => { const f = e.target.files?.[0]; if (f) setImgPreview(URL.createObjectURL(f)) }} />
          </div>
        </div>
      </div>
      <Toggle label="Active" on={isActive} onToggle={() => setIsActive(a => !a)} activeColor="#16a34a" activeTextColor="#4ade80" />
      {add.isError && <p className="text-xs text-red-400">Failed to add variant.</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="px-3 py-1.5 text-xs text-gray-500 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
        <button disabled={add.isPending || !name.trim() || !sku.trim() || !retailPrice} onClick={() => add.mutate()}
          className="px-4 py-1.5 text-xs font-black text-black rounded-lg disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          {add.isPending ? 'Adding...' : 'Add Variant'}
        </button>
      </div>
    </div>
  )
}

// ── Edit Variant Form ─────────────────────────────────────────────────────────

function EditVariantForm({ productId, variant, onDone }: {
  productId: string; variant: AdminProductVariant; onDone: (updated: Partial<AdminProductVariant>) => void
}) {
  const [name, setName] = useState(variant.name)
  const [retailPrice, setRetailPrice] = useState(String(variant.retailPrice))
  const [dealerPrice, setDealerPrice] = useState(String(variant.dealerPrice ?? ''))
  const [bv, setBv] = useState(String(variant.bv ?? ''))
  const [pv, setPv] = useState(String(variant.pv ?? ''))
  const [weight, setWeight] = useState(String(variant.weight ?? ''))
  const [lowStockAlert, setLowStockAlert] = useState(String(variant.lowStockAlert ?? 10))
  const [isActive, setIsActive] = useState(variant.isActive)
  const [sortOrder, setSortOrder] = useState(String(variant.sortOrder ?? 0))
  const imgRef = useRef<HTMLInputElement>(null)
  const [imgPreview, setImgPreview] = useState(variant.imageUrl)

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        retailPrice: parseFloat(retailPrice) || 0,
        dealerPrice: parseFloat(dealerPrice) || 0,
        bv: parseFloat(bv) || 0,
        pv: parseFloat(pv) || 0,
        weight: parseFloat(weight) || 0,
        lowStockAlert: parseInt(lowStockAlert) || 10,
        isActive,
        sortOrder: parseInt(sortOrder) || 0,
      }
      await productsApi.updateVariant(productId, variant.id, payload)
      const file = imgRef.current?.files?.[0]
      if (file) await productsApi.uploadImage(productId, file, variant.id)
      return payload
    },
    onSuccess: (payload) => onDone({ ...payload }),
  })

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2">
          <Label>Name</Label>
          <input className="dark-input mt-1" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <Label>SKU (read-only)</Label>
          <input className="dark-input mt-1 font-mono opacity-50" value={variant.sku} disabled />
        </div>
        <div>
          <Label>Sort Order</Label>
          <input className="dark-input mt-1" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
        </div>
        <div>
          <Label>Retail Price (RM)</Label>
          <input className="dark-input mt-1" type="number" step="0.01" value={retailPrice} onChange={e => setRetailPrice(e.target.value)} />
        </div>
        <div>
          <Label>Consultant Price (RM)</Label>
          <input className="dark-input mt-1" type="number" step="0.01" value={dealerPrice} onChange={e => setDealerPrice(e.target.value)} />
        </div>
        <div>
          <Label>BV</Label>
          <input className="dark-input mt-1" type="number" step="0.01" value={bv} onChange={e => setBv(e.target.value)} />
        </div>
        <div>
          <Label>PV</Label>
          <input className="dark-input mt-1" type="number" step="0.01" value={pv} onChange={e => setPv(e.target.value)} />
        </div>
        <div>
          <Label>Weight (kg)</Label>
          <input className="dark-input mt-1" type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <Label>Low Stock Alert</Label>
          <input className="dark-input mt-1" type="number" value={lowStockAlert} onChange={e => setLowStockAlert(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Variant Image</Label>
        <div className="flex items-center gap-3 mt-1">
          {imgPreview ? (
            <img src={imgPreview} alt="v" className="w-12 h-12 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ImagePlus className="h-4 w-4 text-gray-700" />
            </div>
          )}
          <input ref={imgRef} type="file" accept="image/*"
            className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-900 file:text-yellow-200"
            onChange={e => { const f = e.target.files?.[0]; if (f) setImgPreview(URL.createObjectURL(f)) }} />
        </div>
      </div>
      <Toggle label="Active" on={isActive} onToggle={() => setIsActive(a => !a)} activeColor="#16a34a" activeTextColor="#4ade80" />
      {save.isError && <p className="text-xs text-red-400">Failed to save.</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={() => onDone({})} className="px-3 py-1.5 text-xs text-gray-500 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
        <button disabled={save.isPending} onClick={() => save.mutate()}
          className="px-4 py-1.5 text-xs font-black text-black rounded-lg disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
          {save.isPending ? 'Saving...' : 'Save Variant'}
        </button>
      </div>
    </div>
  )
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: GOLD }}>{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(233,30,140,0.08)' }} />
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-gray-600">{children}</p>
}

function Toggle({ label, on, onToggle, activeColor, activeTextColor }: {
  label: string; on: boolean; onToggle: () => void; activeColor: string; activeTextColor: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div onClick={onToggle} className="w-10 h-5 rounded-full transition-all relative"
        style={{ background: on ? activeColor : 'rgba(255,255,255,0.1)' }}>
        <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: on ? '22px' : '2px' }} />
      </div>
      <span className="text-sm font-medium" style={{ color: on ? activeTextColor : '#6b7280' }}>{label}</span>
    </label>
  )
}
