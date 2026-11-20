import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Image as ImageIcon, Check, X, Sparkles, ExternalLink, Link2 } from 'lucide-react'
import { bannerApi, Banner } from '../../api/banner'

const OLIVE = '#2F4C2C'
const GOLD = '#C5963B'

const URL_PRESETS = [
  { label: 'Semua Produk (/shop)', url: '/shop' },
  { label: 'Prebiotik Ubi Ungu', url: '/products/ascend-purple-sweet-potato' },
  { label: 'Avokado & Moringa', url: '/products/ascend-avocado-moringa' },
  { label: 'Ascend Berry Bloom Kranberi', url: '/products/ascend-ascend-berry-cranberry' },
  { label: 'Daftar Usahawan (/register)', url: '/register' },
  { label: 'AI Nutri-Advisor (/ai-chat)', url: '/ai-chat' },
]

export default function AdminBanners() {
  const qc = useQueryClient()
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: bannerApi.getAdminBanners,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const saveBanner = useMutation({
    mutationFn: async () => {
      let bannerId = currentBanner.id

      if (!bannerId) {
        const res = await bannerApi.createBanner({ ...currentBanner })
        bannerId = res.id
      } else {
        await bannerApi.updateBanner(bannerId, currentBanner)
      }

      if (imageFile && bannerId) {
        await bannerApi.uploadImage(bannerId, imageFile)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
      setIsEditing(false)
      setCurrentBanner({})
      setImageFile(null)
      setImagePreview(null)
    }
  })

  const toggleActive = useMutation({
    mutationFn: (banner: Banner) => bannerApi.updateBanner(banner.id, { ...banner, isActive: !banner.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  })

  const deleteBanner = useMutation({
    mutationFn: bannerApi.deleteBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const openEditor = (banner?: Banner) => {
    if (banner) {
      setCurrentBanner(banner)
      setImagePreview(banner.imageUrl)
    } else {
      setCurrentBanner({ isActive: true, sortOrder: banners.length + 1 })
      setImagePreview(null)
    }
    setImageFile(null)
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Banner Promosi & Slider (Hero Banners)</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Urus banner carousel skrin penuh pada halaman utama (Landing Page).
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-gray-900 shadow-md transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, #FCD34D, ${GOLD})` }}
        >
          <Plus className="h-4 w-4" /> Tambah Banner Baru
        </button>
      </div>

      {/* Editor Modal / Card */}
      {isEditing && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-900/10 shadow-2xl space-y-6 text-gray-900 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-black text-gray-900">
              {currentBanner.id ? 'Kemaskini Banner' : 'Cipta Banner Baru'}
            </h2>
            <span className="text-xs text-gray-500 font-semibold">Resolusi Dicadangkan: 1920 x 800px (16:9 / 21:9 Widescreen)</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Image Upload & Preview */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Imej Banner</label>
              <div className="relative aspect-video bg-emerald-50/50 border-2 border-dashed border-emerald-800/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center hover:bg-emerald-50 transition-colors group cursor-pointer">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      Klik untuk tukar gambar
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 text-emerald-700 opacity-60" />
                    <span className="text-xs font-bold block text-gray-800">Muat Naik Imej Banner</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">JPG, PNG atau WebP (Maks 5MB)</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              {/* Direct image url input */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Atau Masukkan URL Imej:</label>
                <input
                  type="text"
                  value={currentBanner.imageUrl || ''}
                  onChange={e => {
                    setCurrentBanner({ ...currentBanner, imageUrl: e.target.value })
                    setImagePreview(e.target.value)
                  }}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900"
                  placeholder="e.g. /images/banners/banner-1.jpg"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tajuk Utama (Headline Title)</label>
                <input
                  type="text"
                  value={currentBanner.title || ''}
                  onChange={e => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900 font-bold"
                  placeholder="e.g. Revolusi Kesihatan Usus & Tenaga Dopamine"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan Ringkas (Subtitle)</label>
                <input
                  type="text"
                  value={currentBanner.subtitle || ''}
                  onChange={e => setCurrentBanner({ ...currentBanner, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900"
                  placeholder="e.g. 10.4g Serat Prebiotik Inulin Semulajadi Tanpa Gula Tambahan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Pautan Sasaran (Link URL)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Contoh: /shop, /products/..., https://...</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={currentBanner.linkUrl || ''}
                    onChange={e => setCurrentBanner({ ...currentBanner, linkUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900"
                    placeholder="/products/ascend-purple-sweet-potato"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 font-bold self-center">Pilihan Pantas:</span>
                  {URL_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setCurrentBanner({ ...currentBanner, linkUrl: preset.url })}
                      className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Susunan (Sort Order)</label>
                  <input
                    type="number"
                    value={currentBanner.sortOrder || 0}
                    onChange={e => setCurrentBanner({ ...currentBanner, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentBanner.isActive ?? true}
                      onChange={e => setCurrentBanner({ ...currentBanner, isActive: e.target.checked })}
                      className="w-5 h-5 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-800">Aktifkan Banner di Web</span>
                  </label>
                </div>
              </div>

            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => saveBanner.mutate()}
              disabled={saveBanner.isPending || (!imageFile && !currentBanner.imageUrl)}
              className="px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md disabled:opacity-50 transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${OLIVE}, #4E7749)` }}
            >
              {saveBanner.isPending ? 'Menyimpan...' : 'Simpan & Paparkan Banner'}
            </button>
          </div>

        </div>
      )}

      {/* Banner Table List */}
      {!isEditing && (
        <div className="bg-white/5 border border-white/10 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left">
            <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Susunan</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Visual Banner</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tajuk & Pautan</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Sedang memuatkan senarai banner...</td></tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30 text-amber-400" />
                    Belum ada banner promosi. Klik <strong>Tambah Banner Baru</strong> di atas.
                  </td>
                </tr>
              ) : banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-black text-amber-300 text-sm">
                    #{banner.sortOrder}
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-20 w-36 rounded-xl bg-black/20 overflow-hidden border border-white/10 relative group">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Banner" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500"><ImageIcon className="h-6 w-6" /></div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <p className="font-bold text-white text-sm">{banner.title || 'Banner Promosi Ascend Group'}</p>
                    {banner.subtitle && <p className="text-[11px] text-gray-400 line-clamp-1">{banner.subtitle}</p>}
                    {banner.linkUrl ? (
                      <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> {banner.linkUrl}
                      </p>
                    ) : (
                      <span className="text-[10px] text-gray-500 italic">Tiada pautan pautan</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive.mutate(banner)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        banner.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {banner.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {banner.isActive ? 'Dipaparkan' : 'Disembunyikan'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditor(banner)}
                        className="p-2 text-gray-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors"
                        title="Sunting Banner"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if(confirm('Adakah anda pasti untuk memadam banner ini?')) deleteBanner.mutate(banner.id) }}
                        className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Padam Banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
