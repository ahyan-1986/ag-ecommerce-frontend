import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shippingApi } from '../../api/shipping'
import type { ShippingZone, ShippingRate, ShippingRateType, WeightTier, PriceTier } from '../../types'
import {
  Truck, Globe, Plus, Trash2, Pencil, X, Save, Loader2,
  ChevronRight, DollarSign, Weight, Star, Zap, Calculator,
  Package, CreditCard, TrendingDown, Clock, Info, AlertTriangle,
  CheckCircle,
} from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 } as const

// ── Rate type registry ────────────────────────────────────────────────────────
interface RateTypeInfo {
  label: string
  shortLabel: string
  color: string
  icon: React.ReactNode
  description: string
  marketNote: string
}

const RATE_TYPE_INFO: Record<ShippingRateType, RateTypeInfo> = {
  flat: {
    label: 'Flat Rate', shortLabel: 'Flat',
    color: '#60a5fa',
    icon: <DollarSign className="h-3.5 w-3.5" />,
    description: 'Fixed fee regardless of weight, size or order value.',
    marketNote: 'Most common. E.g. RM 8 per order.',
  },
  free: {
    label: 'Free Shipping', shortLabel: 'Free',
    color: '#4ade80',
    icon: <Star className="h-3.5 w-3.5" />,
    description: 'No charge — optionally triggered above a minimum order value.',
    marketNote: 'E.g. Free on orders ≥ RM 100.',
  },
  by_weight: {
    label: 'Weight Tiers', shortLabel: 'By Weight',
    color: '#a78bfa',
    icon: <Weight className="h-3.5 w-3.5" />,
    description: 'Different rates for different weight bands.',
    marketNote: 'E.g. 0–1 kg = RM 7, 1–3 kg = RM 10.',
  },
  flat_plus_kg: {
    label: 'Flat + Per kg', shortLabel: 'Flat+/kg',
    color: '#fb923c',
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    description: 'Base fee + per-kg surcharge above a free weight threshold.',
    marketNote: 'E.g. RM 5 + RM 2/kg above 1 kg. Used by Pos Laju, J&T.',
  },
  by_dimension: {
    label: 'Volumetric', shortLabel: 'Volumetric',
    color: '#C5963B',
    icon: <Package className="h-3.5 w-3.5" />,
    description: 'Charges based on the greater of actual vs volumetric (L×W×H ÷ divisor) weight.',
    marketNote: 'Standard courier practice for bulky/light items. Divisor = 5000 (air) or 6000 (ground).',
  },
  by_price: {
    label: 'Order Value Tiers', shortLabel: 'By Value',
    color: '#34d399',
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    description: 'Shipping fee scales with order subtotal.',
    marketNote: 'E.g. RM 0–50 → RM 8, RM 50–100 → RM 6, RM 100+ → Free.',
  },
  by_item: {
    label: 'Per Item', shortLabel: 'Per Item',
    color: '#fbbf24',
    icon: <Zap className="h-3.5 w-3.5" />,
    description: 'Fixed fee per unit/item in the order, with optional cap.',
    marketNote: 'Common on marketplaces. E.g. RM 2/item, max RM 15.',
  },
  cod: {
    label: 'Cash on Delivery', shortLabel: 'COD',
    color: '#f87171',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    description: 'COD handling fee — flat amount + optional % of order value.',
    marketNote: 'Very common in SEA. E.g. RM 3 + 2% of order, max RM 15.',
  },
}

const ALL_RATE_TYPES = Object.keys(RATE_TYPE_INFO) as ShippingRateType[]

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseArr(s: string): string[] {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}
function parseTiers<T>(s: string): T[] {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}
function fmtRM(n: number) { return `RM ${n.toFixed(2)}` }
function deliveryLabel(min: number, max: number) {
  if (!min && !max) return ''
  if (min === max) return `${min} day${min !== 1 ? 's' : ''}`
  return `${min}–${max} days`
}

// ── Label / Toggle shared ─────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{children}</p>
}
function Toggle({ label, on, onToggle, activeColor = '#16a34a', activeTextColor = '#4ade80' }: {
  label: string; on: boolean; onToggle: () => void; activeColor?: string; activeTextColor?: string
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

// ── Rate Type Badge ───────────────────────────────────────────────────────────
function RateTypeBadge({ type }: { type: ShippingRateType }) {
  const info = RATE_TYPE_INFO[type]
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}30` }}>
      {info.icon} {info.shortLabel}
    </span>
  )
}

// ── Rate Detail Summary (card view) ──────────────────────────────────────────
function RateDetailSummary({ rate }: { rate: ShippingRate }) {
  const weightTiers = parseTiers<WeightTier>(rate.weightTiers)
  const priceTiers = parseTiers<PriceTier>(rate.priceTiers)

  return (
    <div className="mt-2 space-y-1.5 text-xs">
      {rate.rateType === 'flat' && (
        <p className="text-gray-300">Rate: <strong className="text-white">{fmtRM(rate.flatRateRM)}</strong></p>
      )}

      {rate.rateType === 'free' && (
        <p className="text-gray-300">
          {rate.minOrderRM > 0
            ? <>Free on orders ≥ <strong className="text-white">{fmtRM(rate.minOrderRM)}</strong></>
            : 'Always free'}
        </p>
      )}

      {rate.rateType === 'by_weight' && weightTiers.length > 0 && (
        <div className="space-y-0.5">
          {weightTiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[10px] w-28">
                {t.minKg}–{t.maxKg === 0 ? '∞' : t.maxKg} kg
              </span>
              <span className="text-gray-700">→</span>
              <span className="font-semibold" style={{ color: GOLD }}>{fmtRM(t.rateRM)}</span>
            </div>
          ))}
        </div>
      )}

      {rate.rateType === 'flat_plus_kg' && (
        <p className="text-gray-300">
          Base <strong className="text-white">{fmtRM(rate.flatRateRM)}</strong>
          {rate.freeKgLimit > 0 && <> · first <strong className="text-white">{rate.freeKgLimit} kg</strong> free</>}
          {' · '}
          <span className="font-mono" style={{ color: GOLD }}>+{fmtRM(rate.perKgRM)}/kg</span>
        </p>
      )}

      {rate.rateType === 'by_dimension' && (
        <div className="space-y-0.5">
          <p className="text-gray-300">Divisor: <strong className="text-white">{rate.volumetricDivisor || 5000}</strong> cm³/kg</p>
          {rate.perKgRM > 0 && <p className="text-gray-300">Rate: <span className="font-mono" style={{ color: GOLD }}>+{fmtRM(rate.perKgRM)}/chargeable kg</span></p>}
        </div>
      )}

      {rate.rateType === 'by_price' && priceTiers.length > 0 && (
        <div className="space-y-0.5">
          {priceTiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-[10px] w-32">
                RM {t.minRM}–{t.maxRM === 0 ? '∞' : `RM ${t.maxRM}`}
              </span>
              <span className="text-gray-700">→</span>
              <span className="font-semibold" style={{ color: GOLD }}>{t.rateRM === 0 ? 'FREE' : fmtRM(t.rateRM)}</span>
            </div>
          ))}
        </div>
      )}

      {rate.rateType === 'by_item' && (
        <p className="text-gray-300">
          <strong className="text-white">{fmtRM(rate.perItemRM)}</strong>/item
          {rate.maxItemFee > 0 && <>, max <strong className="text-white">{fmtRM(rate.maxItemFee)}</strong></>}
        </p>
      )}

      {rate.rateType === 'cod' && (
        <p className="text-gray-300">
          <strong className="text-white">{fmtRM(rate.codFeeRM)}</strong> + <strong className="text-white">{rate.codFeePercent}%</strong> of order
          {rate.codMaxFeeRM > 0 && <>, max <strong className="text-white">{fmtRM(rate.codMaxFeeRM)}</strong></>}
        </p>
      )}

      {/* Conditions */}
      {rate.minOrderRM > 0 && rate.rateType !== 'free' && (
        <p className="text-[10px] text-gray-600">Min order: {fmtRM(rate.minOrderRM)}</p>
      )}
      {rate.maxOrderRM > 0 && (
        <p className="text-[10px] text-gray-600">Max order: {fmtRM(rate.maxOrderRM)}</p>
      )}

      {/* Delivery estimate */}
      {(rate.estDaysMin > 0 || rate.estDaysMax > 0) && (
        <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3" />
          {deliveryLabel(rate.estDaysMin, rate.estDaysMax)}
          {rate.cutoffTime && ` · Order before ${rate.cutoffTime}`}
        </p>
      )}
    </div>
  )
}

// ── Rate Calculator (test panel) ──────────────────────────────────────────────
function RateCalculator({ zoneId }: { zoneId: string }) {
  const [weight, setWeight] = useState('1')
  const [order, setOrder] = useState('100')
  const [items, setItems] = useState('1')
  const [results, setResults] = useState<{ name: string; carrier: string; rateType: string; costRM: number; estDaysMin: number; estDaysMax: number }[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const res = await shippingApi.calculate({
        country: 'MY',
        weightKg: parseFloat(weight) || 0,
        orderRM: parseFloat(order) || 0,
        itemCount: parseInt(items) || 1,
      })
      // filter to this zone's rates by matching zone rates
      setResults(res as typeof results)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)' }}>
      <div className="flex items-center gap-2">
        <Calculator className="h-3.5 w-3.5 text-blue-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Rate Preview Calculator</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Weight (kg)</Label>
          <input className="dark-input mt-1 text-sm" type="number" step="0.1" min="0" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <Label>Order (RM)</Label>
          <input className="dark-input mt-1 text-sm" type="number" step="1" min="0" value={order} onChange={e => setOrder(e.target.value)} />
        </div>
        <div>
          <Label>Items</Label>
          <input className="dark-input mt-1 text-sm" type="number" min="1" value={items} onChange={e => setItems(e.target.value)} />
        </div>
      </div>
      <button onClick={run} disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5" />}
        Calculate
      </button>
      {results !== null && (
        <div className="space-y-1.5 pt-1 border-t border-blue-900">
          {results.length === 0 && <p className="text-xs text-gray-600">No matching rates found.</p>}
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{r.name}</p>
                {r.carrier && <p className="text-[10px] text-gray-600">{r.carrier}</p>}
                {(r.estDaysMin > 0 || r.estDaysMax > 0) && (
                  <p className="text-[10px] text-gray-600">{deliveryLabel(r.estDaysMin, r.estDaysMax)}</p>
                )}
              </div>
              <span className="text-sm font-black" style={{ color: r.costRM === 0 ? '#4ade80' : GOLD }}>
                {r.costRM === 0 ? 'FREE' : fmtRM(r.costRM)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
  void zoneId // used to namespace future calls
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminShipping() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const qc = useQueryClient()

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['admin', 'shipping', 'zones'],
    queryFn: shippingApi.listZones,
  })

  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ['admin', 'shipping', 'rates', selectedZoneId],
    queryFn: () => shippingApi.listRates(selectedZoneId ?? undefined),
    enabled: !!selectedZoneId,
  })

  const delZone = useMutation({
    mutationFn: (id: string) => shippingApi.deleteZone(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'shipping', 'zones'] }); setSelectedZoneId(null) },
  })
  const delRate = useMutation({
    mutationFn: (id: string) => shippingApi.deleteRate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'shipping', 'rates', selectedZoneId] }),
  })

  const selectedZone = zones?.find(z => z.id === selectedZoneId)

  // KPI counts
  const totalZones = zones?.length ?? 0
  const activeZones = zones?.filter(z => z.isActive).length ?? 0
  const totalRates = zones?.reduce((a, z) => a + (z.rates?.length ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Shipping</h1>
          <p className="text-xs text-gray-600 mt-0.5">Manage zones, carriers and multi-type rate rules</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {totalZones} zones · {activeZones} active · {totalRates} rates
          </span>
        </div>
      </div>

      {/* Rate type legend pills */}
      <div className="flex flex-wrap gap-2">
        {ALL_RATE_TYPES.map(rt => {
          const info = RATE_TYPE_INFO[rt]
          return (
            <div key={rt} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: `${info.color}10`, color: info.color, border: `1px solid ${info.color}25` }}>
              {info.icon} {info.shortLabel}
            </div>
          )
        })}
        <span className="text-[10px] text-gray-700 self-center ml-1">— 8 rate types supported</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* ── Left: Zones ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5" style={card}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" style={{ color: GOLD }} />
                <span className="font-bold text-white text-sm">Shipping Zones</span>
                {zones && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(233,30,140,0.08)', color: GOLD }}>{zones.length}</span>}
              </div>
              <button onClick={() => { setEditingZone(null); setShowZoneModal(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                <Plus className="h-3.5 w-3.5" /> Add Zone
              </button>
            </div>

            {zonesLoading && <div className="text-center py-8 text-gray-600"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>}

            {!zonesLoading && zones?.length === 0 && (
              <div className="text-center py-10 text-gray-700">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No shipping zones yet</p>
                <p className="text-xs mt-1 text-gray-700">Create a zone to start adding rate rules</p>
              </div>
            )}

            <div className="space-y-2">
              {zones?.map(zone => {
                const countries = parseArr(zone.countries)
                const rateCount = zone.rates?.length ?? 0
                return (
                  <div key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)}
                    className="px-4 py-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: selectedZoneId === zone.id ? `1.5px solid ${GOLD}` : '1px solid rgba(255,255,255,0.07)',
                      background: selectedZoneId === zone.id ? 'rgba(233,30,140,0.05)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{zone.name}</span>
                          {!zone.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Inactive</span>}
                        </div>
                        {zone.description && <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{zone.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {countries.slice(0, 5).map(c => (
                            <span key={c} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>{c}</span>
                          ))}
                          {countries.length > 5 && <span className="text-[10px] text-gray-600">+{countries.length - 5}</span>}
                          {countries.length === 0 && <span className="text-[10px] text-gray-700 italic">All countries</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-gray-600">{rateCount} rate{rateCount !== 1 ? 's' : ''}</span>
                          {zone.rates && zone.rates.length > 0 && (
                            <div className="flex gap-1">
                              {Array.from(new Set(zone.rates.map(r => r.rateType))).map(rt => (
                                <span key={rt} className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                                  style={{ background: `${RATE_TYPE_INFO[rt].color}15`, color: RATE_TYPE_INFO[rt].color }}>
                                  {RATE_TYPE_INFO[rt].shortLabel}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); setEditingZone(zone); setShowZoneModal(true) }}
                          className="text-gray-600 hover:text-yellow-400 transition-colors p-1">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); if (confirm(`Delete zone "${zone.name}"?`)) delZone.mutate(zone.id) }}
                          className="text-gray-700 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Rates ── */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedZoneId ? (
            <div className="p-10 flex items-center justify-center" style={{ ...card, minHeight: 320 }}>
              <div className="text-center text-gray-700">
                <Truck className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-gray-500">Select a shipping zone</p>
                <p className="text-xs mt-1">to view and manage its rate rules</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-5" style={card}>
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" style={{ color: GOLD }} />
                      <span className="font-bold text-white text-sm">{selectedZone?.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {parseArr(selectedZone?.countries ?? '').join(', ') || 'All countries'}
                      {parseArr(selectedZone?.states ?? '').length > 0 && ` · ${parseArr(selectedZone?.states ?? '').join(', ')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowCalculator(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={showCalculator
                        ? { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }
                        : { color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Calculator className="h-3.5 w-3.5" /> Test Rates
                    </button>
                    <button onClick={() => { setEditingRate(null); setShowRateModal(true) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
                      style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                      <Plus className="h-3.5 w-3.5" /> Add Rate
                    </button>
                  </div>
                </div>

                {/* Calculator */}
                {showCalculator && selectedZoneId && (
                  <div className="mb-5">
                    <RateCalculator zoneId={selectedZoneId} />
                  </div>
                )}

                {ratesLoading && <div className="text-center py-8 text-gray-600"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>}

                {!ratesLoading && rates?.length === 0 && (
                  <div className="text-center py-12 text-gray-700">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-25" />
                    <p className="text-sm">No rates configured for this zone</p>
                    <p className="text-xs mt-1">Add a rate rule to enable shipping</p>
                  </div>
                )}

                <div className="space-y-3">
                  {rates?.map(rate => (
                    <div key={rate.id} className="px-4 py-4 rounded-xl transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{rate.name}</span>
                            {rate.carrier && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
                                {rate.carrier}
                              </span>
                            )}
                            <RateTypeBadge type={rate.rateType} />
                            {!rate.isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Inactive</span>
                            )}
                          </div>
                          <RateDetailSummary rate={rate} />
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => { setEditingRate(rate); setShowRateModal(true) }}
                            className="text-gray-600 hover:text-yellow-400 transition-colors p-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { if (confirm(`Delete rate "${rate.name}"?`)) delRate.mutate(rate.id) }}
                            className="text-gray-700 hover:text-red-400 transition-colors p-1.5">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showZoneModal && (
        <ZoneModal zone={editingZone ?? undefined} onClose={() => setShowZoneModal(false)} />
      )}
      {showRateModal && selectedZoneId && (
        <RateModal zoneId={selectedZoneId} rate={editingRate ?? undefined} onClose={() => setShowRateModal(false)} />
      )}
    </div>
  )
}

// ── Zone Modal ────────────────────────────────────────────────────────────────
function ZoneModal({ zone, onClose }: { zone?: ShippingZone; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!zone
  const [name, setName] = useState(zone?.name ?? '')
  const [description, setDescription] = useState(zone?.description ?? '')
  const [countries, setCountries] = useState(parseArr(zone?.countries ?? '').join(', '))
  const [states, setStates] = useState(parseArr(zone?.states ?? '').join(', '))
  const [isActive, setIsActive] = useState(zone?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(String(zone?.sortOrder ?? 0))

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name, description, isActive, sortOrder: parseInt(sortOrder) || 0,
        countries: countries.split(',').map(s => s.trim()).filter(Boolean),
        states: states.split(',').map(s => s.trim()).filter(Boolean),
      }
      if (isEdit) return shippingApi.updateZone(zone.id, payload)
      return shippingApi.createZone({ ...payload, isActive: payload.isActive })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'shipping', 'zones'] }); onClose() },
  })

  const COMMON_ZONES = [
    { name: 'West Malaysia', countries: 'MY', states: 'Johor, Kedah, Kelantan, Melaka, Negeri Sembilan, Pahang, Perak, Perlis, Penang, Pulau Pinang, Selangor, Terengganu, Kuala Lumpur, Putrajaya, Labuan' },
    { name: 'East Malaysia', countries: 'MY', states: 'Sabah, Sarawak' },
    { name: 'Singapore', countries: 'SG', states: '' },
    { name: 'International', countries: '', states: '' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg" style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="font-black text-white">{isEdit ? 'Edit Zone' : 'New Shipping Zone'}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick templates */}
          {!isEdit && (
            <div>
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_ZONES.map(z => (
                  <button key={z.name} onClick={() => {
                    setName(z.name)
                    setCountries(z.countries)
                    setStates(z.states)
                  }}
                    className="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all"
                    style={{ background: 'rgba(233,30,140,0.07)', color: GOLD, border: '1px solid rgba(233,30,140,0.18)' }}>
                    {z.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Zone Name *</Label>
            <input className="dark-input mt-1" value={name} placeholder="West Malaysia" onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <input className="dark-input mt-1" value={description} placeholder="Peninsular Malaysia shipping zone" onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Countries (comma separated, empty = all)</Label>
            <input className="dark-input mt-1" value={countries} placeholder="MY, SG, BN" onChange={e => setCountries(e.target.value)} />
            <p className="text-[10px] text-gray-700 mt-1">ISO 3166-1 alpha-2 codes: MY, SG, BN, TH, ID, PH, AU, GB...</p>
          </div>
          <div>
            <Label>States / Regions (comma separated, empty = all states)</Label>
            <input className="dark-input mt-1" value={states} placeholder="Selangor, Kuala Lumpur, Putrajaya" onChange={e => setStates(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sort Order</Label>
              <input className="dark-input mt-1" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
            </div>
            <div className="flex items-end pb-1">
              <Toggle label="Active" on={isActive} onToggle={() => setIsActive(a => !a)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {save.isError && <span className="text-xs text-red-400 mr-auto">Failed to save zone.</span>}
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button disabled={save.isPending || !name.trim()} onClick={() => save.mutate()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black text-black disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            <Save className="h-4 w-4" />
            {save.isPending ? 'Saving...' : isEdit ? 'Save Zone' : 'Create Zone'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Rate Modal ────────────────────────────────────────────────────────────────
function RateModal({ zoneId, rate, onClose }: { zoneId: string; rate?: ShippingRate; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!rate
  const [name, setName] = useState(rate?.name ?? '')
  const [carrier, setCarrier] = useState(rate?.carrier ?? '')
  const [rateType, setRateType] = useState<ShippingRateType>(rate?.rateType ?? 'flat')
  const [isActive, setIsActive] = useState(rate?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(String(rate?.sortOrder ?? 0))

  // Flat / base
  const [flatRateRM, setFlatRateRM] = useState(String(rate?.flatRateRM ?? ''))

  // Weight tiers
  const [weightTiers, setWeightTiers] = useState<WeightTier[]>(parseTiers<WeightTier>(rate?.weightTiers ?? ''))
  const addWeightTier = () => setWeightTiers(t => [...t, { minKg: 0, maxKg: 0, rateRM: 0 }])
  const removeWeightTier = (i: number) => setWeightTiers(t => t.filter((_, j) => j !== i))
  const updateWeightTier = (i: number, f: keyof WeightTier, v: number) =>
    setWeightTiers(t => t.map((tier, j) => j === i ? { ...tier, [f]: v } : tier))

  // Flat + per kg
  const [perKgRM, setPerKgRM] = useState(String(rate?.perKgRM ?? ''))
  const [freeKgLimit, setFreeKgLimit] = useState(String(rate?.freeKgLimit ?? '0'))

  // Volumetric
  const [volumetricDivisor, setVolumetricDivisor] = useState(String(rate?.volumetricDivisor ?? '5000'))

  // Price tiers
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(parseTiers<PriceTier>(rate?.priceTiers ?? ''))
  const addPriceTier = () => setPriceTiers(t => [...t, { minRM: 0, maxRM: 0, rateRM: 0 }])
  const removePriceTier = (i: number) => setPriceTiers(t => t.filter((_, j) => j !== i))
  const updatePriceTier = (i: number, f: keyof PriceTier, v: number) =>
    setPriceTiers(t => t.map((tier, j) => j === i ? { ...tier, [f]: v } : tier))

  // Per-item
  const [perItemRM, setPerItemRM] = useState(String(rate?.perItemRM ?? ''))
  const [maxItemFee, setMaxItemFee] = useState(String(rate?.maxItemFee ?? '0'))

  // COD
  const [codFeeRM, setCodFeeRM] = useState(String(rate?.codFeeRM ?? ''))
  const [codFeePercent, setCodFeePercent] = useState(String(rate?.codFeePercent ?? ''))
  const [codMaxFeeRM, setCodMaxFeeRM] = useState(String(rate?.codMaxFeeRM ?? '0'))

  // Conditions
  const [minOrderRM, setMinOrderRM] = useState(String(rate?.minOrderRM ?? '0'))
  const [maxOrderRM, setMaxOrderRM] = useState(String(rate?.maxOrderRM ?? '0'))

  // Delivery
  const [estDaysMin, setEstDaysMin] = useState(String(rate?.estDaysMin ?? ''))
  const [estDaysMax, setEstDaysMax] = useState(String(rate?.estDaysMax ?? ''))
  const [cutoffTime, setCutoffTime] = useState(rate?.cutoffTime ?? '')

  // Reset field defaults when switching type
  useEffect(() => {
    if (rateType === 'by_dimension' && !volumetricDivisor) setVolumetricDivisor('5000')
  }, [rateType])

  const CARRIER_PRESETS = ['J&T Express', 'Pos Laju', 'DHL Express', 'FedEx', 'GDex', 'Ninja Van', 'Lalamove', 'Own Delivery']

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        zoneId, name, carrier, rateType, isActive, sortOrder: parseInt(sortOrder) || 0,
        flatRateRM: parseFloat(flatRateRM) || 0,
        weightTiers, perKgRM: parseFloat(perKgRM) || 0, freeKgLimit: parseFloat(freeKgLimit) || 0,
        volumetricDivisor: parseFloat(volumetricDivisor) || 5000,
        priceTiers,
        perItemRM: parseFloat(perItemRM) || 0, maxItemFee: parseFloat(maxItemFee) || 0,
        codFeeRM: parseFloat(codFeeRM) || 0, codFeePercent: parseFloat(codFeePercent) || 0, codMaxFeeRM: parseFloat(codMaxFeeRM) || 0,
        minOrderRM: parseFloat(minOrderRM) || 0, maxOrderRM: parseFloat(maxOrderRM) || 0,
        estDaysMin: parseInt(estDaysMin) || 0, estDaysMax: parseInt(estDaysMax) || 0,
        cutoffTime,
      }
      if (isEdit) return shippingApi.updateRate(rate.id, payload)
      return shippingApi.createRate(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'shipping', 'rates', zoneId] }); onClose() },
  })

  const info = RATE_TYPE_INFO[rateType]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-6 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl mb-6" style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="font-black text-white">{isEdit ? 'Edit Rate' : 'New Rate Rule'}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rate Name *</Label>
              <input className="dark-input mt-1" value={name} placeholder="Standard Shipping" onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Carrier</Label>
              <div className="relative mt-1">
                <input className="dark-input w-full" list="carrier-list" value={carrier} placeholder="J&T, Poslaju, DHL..." onChange={e => setCarrier(e.target.value)} />
                <datalist id="carrier-list">
                  {CARRIER_PRESETS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
          </div>

          {/* Rate Type Selector */}
          <div>
            <Label>Rate Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {ALL_RATE_TYPES.map(rt => {
                const i = RATE_TYPE_INFO[rt]
                return (
                  <button key={rt} onClick={() => setRateType(rt)}
                    className="flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left"
                    style={rateType === rt
                      ? { background: `${i.color}15`, color: i.color, border: `1.5px solid ${i.color}40` }
                      : { color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: rateType === rt ? i.color : '#6b7280' }}>{i.icon}</span>
                    {i.label}
                  </button>
                )
              })}
            </div>
            {/* Type description */}
            <div className="mt-3 px-3 py-2.5 rounded-xl flex items-start gap-2"
              style={{ background: `${info.color}08`, border: `1px solid ${info.color}20` }}>
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: info.color }} />
              <div>
                <p className="text-xs text-white">{info.description}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{info.marketNote}</p>
              </div>
            </div>
          </div>

          {/* ── Type-specific fields ── */}

          {/* FLAT */}
          {rateType === 'flat' && (
            <div>
              <Label>Flat Rate (RM) *</Label>
              <input className="dark-input mt-1 max-w-xs" type="number" step="0.01" min="0" value={flatRateRM}
                placeholder="8.00" onChange={e => setFlatRateRM(e.target.value)} />
            </div>
          )}

          {/* FREE */}
          {rateType === 'free' && (
            <div>
              <Label>Min Order for Free Shipping (RM, 0 = always free)</Label>
              <input className="dark-input mt-1 max-w-xs" type="number" step="0.01" min="0" value={minOrderRM}
                placeholder="100.00" onChange={e => setMinOrderRM(e.target.value)} />
              <p className="text-[10px] text-gray-700 mt-1">If not met, charge fallback flat rate below (optional).</p>
            </div>
          )}

          {/* BY WEIGHT */}
          {rateType === 'by_weight' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Weight Tiers</Label>
                <button onClick={addWeightTier} className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <Plus className="h-3 w-3" /> Add Tier
                </button>
              </div>
              {weightTiers.length === 0 && <p className="text-xs text-gray-600 py-2">No tiers yet. Add at least one weight band.</p>}
              <div className="space-y-2">
                {weightTiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Min (kg)</p>}
                        <input className="dark-input" type="number" step="0.1" min="0" value={tier.minKg}
                          onChange={e => updateWeightTier(i, 'minKg', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Max (kg, 0=∞)</p>}
                        <input className="dark-input" type="number" step="0.1" min="0" value={tier.maxKg}
                          onChange={e => updateWeightTier(i, 'maxKg', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Rate (RM)</p>}
                        <input className="dark-input" type="number" step="0.01" min="0" value={tier.rateRM}
                          onChange={e => updateWeightTier(i, 'rateRM', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <button onClick={() => removeWeightTier(i)} className={`text-gray-700 hover:text-red-400 flex-shrink-0 ${i === 0 ? 'mt-4' : ''}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {weightTiers.length > 0 && <p className="text-[10px] text-gray-700 mt-2">Set Max to 0 on the last tier for unlimited weight.</p>}
            </div>
          )}

          {/* FLAT PLUS PER KG */}
          {rateType === 'flat_plus_kg' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Base Fee (RM)</Label>
                <input className="dark-input mt-1" type="number" step="0.01" min="0" value={flatRateRM}
                  placeholder="5.00" onChange={e => setFlatRateRM(e.target.value)} />
              </div>
              <div>
                <Label>Free up to (kg)</Label>
                <input className="dark-input mt-1" type="number" step="0.1" min="0" value={freeKgLimit}
                  placeholder="1.0" onChange={e => setFreeKgLimit(e.target.value)} />
              </div>
              <div>
                <Label>Rate per kg (RM)</Label>
                <input className="dark-input mt-1" type="number" step="0.01" min="0" value={perKgRM}
                  placeholder="2.00" onChange={e => setPerKgRM(e.target.value)} />
              </div>
              <div className="col-span-3 px-3 py-2 rounded-lg text-[10px] text-gray-500"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                Preview: RM {(parseFloat(flatRateRM) || 0).toFixed(2)} base + RM {(parseFloat(perKgRM) || 0).toFixed(2)}/kg above {parseFloat(freeKgLimit) || 0} kg free
              </div>
            </div>
          )}

          {/* BY DIMENSION (volumetric) */}
          {rateType === 'by_dimension' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Volumetric Divisor (cm³/kg)</Label>
                  <input className="dark-input mt-1" type="number" step="100" min="100" value={volumetricDivisor}
                    onChange={e => setVolumetricDivisor(e.target.value)} />
                  <p className="text-[10px] text-gray-700 mt-1">5000 = air freight standard · 6000 = road/ground</p>
                </div>
                <div>
                  <Label>Base Fee (RM, optional)</Label>
                  <input className="dark-input mt-1" type="number" step="0.01" min="0" value={flatRateRM}
                    placeholder="0.00" onChange={e => setFlatRateRM(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Free kg threshold</Label>
                  <input className="dark-input mt-1" type="number" step="0.1" min="0" value={freeKgLimit}
                    placeholder="0" onChange={e => setFreeKgLimit(e.target.value)} />
                </div>
                <div>
                  <Label>Rate per chargeable kg (RM)</Label>
                  <input className="dark-input mt-1" type="number" step="0.01" min="0" value={perKgRM}
                    placeholder="2.00" onChange={e => setPerKgRM(e.target.value)} />
                </div>
              </div>
              <div className="px-3 py-2.5 rounded-xl text-xs text-gray-400" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)' }}>
                <strong className="text-white">Volumetric weight</strong> = L×W×H (cm) ÷ {parseFloat(volumetricDivisor) || 5000}.
                Carrier charges the <em>greater</em> of actual vs volumetric weight.
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Weight Tiers (optional — overrides per-kg rate)</Label>
                  <button onClick={addWeightTier} className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(244,114,182,0.1)', color: '#C5963B', border: '1px solid rgba(244,114,182,0.2)' }}>
                    <Plus className="h-3 w-3" /> Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {weightTiers.map((tier, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Min (kg)</p>}
                          <input className="dark-input" type="number" step="0.1" min="0" value={tier.minKg}
                            onChange={e => updateWeightTier(i, 'minKg', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                          {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Max (kg, 0=∞)</p>}
                          <input className="dark-input" type="number" step="0.1" min="0" value={tier.maxKg}
                            onChange={e => updateWeightTier(i, 'maxKg', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div>
                          {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Rate (RM)</p>}
                          <input className="dark-input" type="number" step="0.01" min="0" value={tier.rateRM}
                            onChange={e => updateWeightTier(i, 'rateRM', parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                      <button onClick={() => removeWeightTier(i)} className={`text-gray-700 hover:text-red-400 flex-shrink-0 ${i === 0 ? 'mt-4' : ''}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BY PRICE */}
          {rateType === 'by_price' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Order Value Tiers</Label>
                <button onClick={addPriceTier} className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <Plus className="h-3 w-3" /> Add Tier
                </button>
              </div>
              {priceTiers.length === 0 && <p className="text-xs text-gray-600 py-2">No tiers yet. Add at least one value band.</p>}
              <div className="space-y-2">
                {priceTiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Min (RM)</p>}
                        <input className="dark-input" type="number" step="1" min="0" value={tier.minRM}
                          onChange={e => updatePriceTier(i, 'minRM', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Max (RM, 0=∞)</p>}
                        <input className="dark-input" type="number" step="1" min="0" value={tier.maxRM}
                          onChange={e => updatePriceTier(i, 'maxRM', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        {i === 0 && <p className="text-[10px] text-gray-600 mb-1">Rate (RM, 0=free)</p>}
                        <input className="dark-input" type="number" step="0.01" min="0" value={tier.rateRM}
                          onChange={e => updatePriceTier(i, 'rateRM', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <button onClick={() => removePriceTier(i)} className={`text-gray-700 hover:text-red-400 flex-shrink-0 ${i === 0 ? 'mt-4' : ''}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {priceTiers.length > 0 && <p className="text-[10px] text-gray-700 mt-2">Tip: Set Rate to 0 for a free-shipping tier.</p>}
            </div>
          )}

          {/* BY ITEM */}
          {rateType === 'by_item' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fee per Item (RM) *</Label>
                <input className="dark-input mt-1" type="number" step="0.01" min="0" value={perItemRM}
                  placeholder="2.00" onChange={e => setPerItemRM(e.target.value)} />
              </div>
              <div>
                <Label>Max Total Fee (RM, 0 = no cap)</Label>
                <input className="dark-input mt-1" type="number" step="0.01" min="0" value={maxItemFee}
                  placeholder="15.00" onChange={e => setMaxItemFee(e.target.value)} />
              </div>
              <div className="col-span-2 text-[10px] text-gray-600 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                Preview: {parseInt(perItemRM) || 0} items × RM {parseFloat(perItemRM) || 0} = RM {((parseInt('1') || 1) * (parseFloat(perItemRM) || 0)).toFixed(2)}
                {parseFloat(maxItemFee) > 0 && `, capped at RM ${parseFloat(maxItemFee).toFixed(2)}`}
              </div>
            </div>
          )}

          {/* COD */}
          {rateType === 'cod' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Flat COD Fee (RM)</Label>
                  <input className="dark-input mt-1" type="number" step="0.01" min="0" value={codFeeRM}
                    placeholder="3.00" onChange={e => setCodFeeRM(e.target.value)} />
                </div>
                <div>
                  <Label>% of Order Value</Label>
                  <input className="dark-input mt-1" type="number" step="0.1" min="0" max="100" value={codFeePercent}
                    placeholder="2.0" onChange={e => setCodFeePercent(e.target.value)} />
                </div>
                <div>
                  <Label>Max COD Fee (RM, 0=no cap)</Label>
                  <input className="dark-input mt-1" type="number" step="0.01" min="0" value={codMaxFeeRM}
                    placeholder="15.00" onChange={e => setCodMaxFeeRM(e.target.value)} />
                </div>
              </div>
              <div className="px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
                style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                <span className="text-gray-400">COD adds a collection handling fee on top of the delivery charge. Formula: RM {parseFloat(codFeeRM) || 0} + {parseFloat(codFeePercent) || 0}% of order value{parseFloat(codMaxFeeRM) > 0 ? `, max RM ${parseFloat(codMaxFeeRM)}` : ''}.</span>
              </div>
            </div>
          )}

          {/* Fallback flat rate (shown for non-flat, non-free types) */}
          {!['flat', 'free'].includes(rateType) && rateType !== 'flat_plus_kg' && (
            <div>
              <Label>Fallback Flat Rate (RM) — used if no tier matches</Label>
              <input className="dark-input mt-1 max-w-xs" type="number" step="0.01" min="0" value={flatRateRM}
                placeholder="0.00" onChange={e => setFlatRateRM(e.target.value)} />
            </div>
          )}

          {/* ── Conditions ── */}
          {!['free'].includes(rateType) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-900">
              <div>
                <Label>Min Order Condition (RM, 0 = none)</Label>
                <input className="dark-input mt-1" type="number" step="0.01" min="0" value={minOrderRM}
                  placeholder="0.00" onChange={e => setMinOrderRM(e.target.value)} />
                <p className="text-[10px] text-gray-700 mt-1">Rate only shown when order ≥ this amount</p>
              </div>
              <div>
                <Label>Max Order Condition (RM, 0 = no max)</Label>
                <input className="dark-input mt-1" type="number" step="0.01" min="0" value={maxOrderRM}
                  placeholder="0.00" onChange={e => setMaxOrderRM(e.target.value)} />
                <p className="text-[10px] text-gray-700 mt-1">Rate hidden when order exceeds this</p>
              </div>
            </div>
          )}

          {/* ── Delivery Estimate ── */}
          <div className="pt-4 border-t border-gray-900 space-y-3">
            <Label>Delivery Estimate (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Min days</Label>
                <input className="dark-input mt-1" type="number" min="0" value={estDaysMin}
                  placeholder="1" onChange={e => setEstDaysMin(e.target.value)} />
              </div>
              <div>
                <Label>Max days</Label>
                <input className="dark-input mt-1" type="number" min="0" value={estDaysMax}
                  placeholder="3" onChange={e => setEstDaysMax(e.target.value)} />
              </div>
              <div>
                <Label>Same-day cutoff</Label>
                <input className="dark-input mt-1" type="time" value={cutoffTime}
                  onChange={e => setCutoffTime(e.target.value)} />
              </div>
            </div>
            {(estDaysMin || estDaysMax) && (
              <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                Shown to customer as: <strong className="text-white ml-1">{deliveryLabel(parseInt(estDaysMin) || 0, parseInt(estDaysMax) || 0)}</strong>
                {cutoffTime && <span className="text-gray-600"> · Order before {cutoffTime}</span>}
              </div>
            )}
          </div>

          {/* ── Active + Sort ── */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-900">
            <div>
              <Label>Sort Order</Label>
              <input className="dark-input mt-1" type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
            </div>
            <div className="flex items-end pb-1">
              <Toggle label="Active" on={isActive} onToggle={() => setIsActive(a => !a)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {save.isError && <span className="text-xs text-red-400 mr-auto">Failed to save rate.</span>}
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button disabled={save.isPending || !name.trim()} onClick={() => save.mutate()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black text-black disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
            <Save className="h-4 w-4" />
            {save.isPending ? 'Saving...' : isEdit ? 'Save Rate' : 'Create Rate'}
          </button>
        </div>
      </div>
    </div>
  )
}
