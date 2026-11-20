import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../api/client'
import { productsApi } from '../../api/products'
import type { InventoryMovement, AdminProduct, AdminProductVariant } from '../../types'
import {
  Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCw,
  Search, Loader2, Plus, Minus, X, FileText, ArrowUpDown,
  BarChart3, ShoppingBag, Activity, ClipboardList, ArrowDownToLine
} from 'lucide-react'

const ROSE = '#3A5D36'; const PINK = '#C5963B'; const GOLD = '#C5963B'

const card = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 } as const
const th = 'pb-3 pr-3 text-left text-[10px] font-bold tracking-widest uppercase text-gray-600 whitespace-nowrap'
const td = 'py-3 pr-3 text-sm'

const MOV_TYPES = [
  { value: 'receive',   label: 'Receive',    color: '#4ade80', icon: <TrendingUp className="h-3 w-3" /> },
  { value: 'sale',      label: 'Sale',       color: '#f87171', icon: <TrendingDown className="h-3 w-3" /> },
  { value: 'adjust',    label: 'Adjust',     color: '#60a5fa', icon: <ArrowUpDown className="h-3 w-3" /> },
  { value: 'return',    label: 'Return',     color: '#a78bfa', icon: <RefreshCw className="h-3 w-3" /> },
  { value: 'write_off', label: 'Write-Off',  color: '#fb923c', icon: <X className="h-3 w-3" /> },
]
function movStyle(type: string) {
  return MOV_TYPES.find(t => t.value === type) ?? { value: type, label: type, color: '#9ca3af', icon: null }
}

// ── Data Fetchers ─────────────────────────────────────────────────────────────

interface InventorySummary {
  totalVariants: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
  totalMovements: number
}

interface BulkReceiveItem {
  variantId: string
  quantity: number
  note: string
}

const inventoryApi = {
  adjustStock: (data: { variantId: string; type: string; quantity: number; reference?: string; note?: string }) =>
    apiClient.post<InventoryMovement>('/admin/inventory/adjust', data).then(r => r.data),

  bulkReceive: (data: { reference: string; note: string; items: BulkReceiveItem[] }) =>
    apiClient.post<{ movements: InventoryMovement[]; count: number }>('/admin/inventory/bulk-receive', data).then(r => r.data),

  listMovements: (params: { variantId?: string; type?: string; page?: number; pageSize?: number }) =>
    apiClient.get<{ items: InventoryMovement[]; total: number; page: number; pageSize: number }>(
      '/admin/inventory/movements', { params }
    ).then(r => r.data),

  getLowStock: () =>
    apiClient.get<Array<{
      variantId: string; productName: string; variantName: string
      sku: string; stockOnHand: number; lowStockAlert: number
    }>>('/admin/inventory/low-stock').then(r => r.data),

  getSummary: () =>
    apiClient.get<InventorySummary>('/admin/inventory/summary').then(r => r.data),
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'stock' | 'low-stock' | 'movements' | 'receive' | 'adjust'

export default function AdminInventory() {
  const [tab, setTab] = useState<Tab>('overview')

  const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: 'overview',   label: 'Overview',      icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { value: 'stock',      label: 'Stock Levels',  icon: <Package className="h-3.5 w-3.5" /> },
    { value: 'low-stock',  label: 'Low Stock',     icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    { value: 'movements',  label: 'Movement Log',  icon: <FileText className="h-3.5 w-3.5" /> },
    { value: 'receive',    label: 'Bulk Receive',  icon: <ArrowDownToLine className="h-3.5 w-3.5" /> },
    { value: 'adjust',     label: 'Adjust',        icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Inventory</h1>
        <p className="text-xs text-gray-600 mt-0.5">Real-time stock management, bulk receiving, movements, and alerts</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            style={tab === t.value
              ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' }
              : { color: '#6b7280' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview'   && <OverviewTab />}
      {tab === 'stock'      && <StockLevelsTab onAdjust={() => setTab('adjust')} />}
      {tab === 'low-stock'  && <LowStockTab />}
      {tab === 'movements'  && <MovementsTab />}
      {tab === 'receive'    && <BulkReceiveTab />}
      {tab === 'adjust'     && <AdjustTab />}
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'inventory', 'summary'],
    queryFn: inventoryApi.getSummary,
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['admin', 'inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  })

  const { data: recentMovements } = useQuery({
    queryKey: ['admin', 'inventory', 'movements', '', 1],
    queryFn: () => inventoryApi.listMovements({ page: 1, pageSize: 8 }),
  })

  const kpis = [
    { label: 'Total Variants', value: data?.totalVariants ?? '—', icon: Package, color: GOLD, subtext: 'Active SKUs' },
    { label: 'Stock Value', value: data ? `RM ${data.totalStockValue.toFixed(2)}` : '—', icon: BarChart3, color: '#4ade80', subtext: 'At retail price' },
    { label: 'Low Stock', value: data?.lowStockCount ?? '—', icon: AlertTriangle, color: '#fbbf24', subtext: 'Variants near threshold' },
    { label: 'Out of Stock', value: data?.outOfStockCount ?? '—', icon: ShoppingBag, color: '#f87171', subtext: 'Variants at zero' },
    { label: 'Movements', value: data?.totalMovements ?? '—', icon: Activity, color: '#60a5fa', subtext: 'All-time transactions' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Inventory Health</p>
        <button onClick={() => refetch()} className="text-gray-600 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, subtext }) => (
            <div key={label} className="rounded-2xl p-5" style={card}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</span>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-[10px] text-gray-600 mt-1">{subtext}</p>
            </div>
          ))}
        </div>
      )}

      {/* Widgets row */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Critical alerts */}
        <div className="rounded-2xl" style={card}>
          <div className="px-5 py-4 border-b border-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold text-white">Stock Alerts</span>
            {lowStockData && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                {lowStockData.length}
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-900/60">
            {(!lowStockData || lowStockData.length === 0) && (
              <div className="px-5 py-8 text-center text-gray-600 text-xs">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                All stock levels healthy
              </div>
            )}
            {lowStockData?.slice(0, 5).map(item => {
              const isOut = item.stockOnHand === 0
              return (
                <div key={item.variantId} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-gray-200">{item.productName}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{item.sku} — {item.variantName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color: isOut ? '#f87171' : '#fbbf24' }}>
                      {item.stockOnHand}
                    </p>
                    <p className="text-[10px] text-gray-600">alert at {item.lowStockAlert}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent movements */}
        <div className="rounded-2xl" style={card}>
          <div className="px-5 py-4 border-b border-gray-900 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" style={{ color: GOLD }} />
            <span className="text-sm font-bold text-white">Recent Movements</span>
          </div>
          <div className="divide-y divide-gray-900/60">
            {(!recentMovements?.items?.length) && (
              <div className="px-5 py-8 text-center text-gray-600 text-xs">No movements yet.</div>
            )}
            {recentMovements?.items?.map(m => {
              const mt = movStyle(m.type)
              return (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: mt.color }}>
                      {mt.icon} {mt.label}
                    </span>
                    <div>
                      <p className="text-xs text-gray-300">{m.variant?.name ?? m.variantId.slice(0, 8)}</p>
                      <p className="text-[10px] text-gray-600">{new Date(m.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: m.quantity > 0 ? '#4ade80' : '#f87171' }}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stock Levels Tab ──────────────────────────────────────────────────────────

function StockLevelsTab({ onAdjust: _onAdjust }: { onAdjust: () => void }) {
  const [search, setSearch] = useState('')
  const [adjustingVariant, setAdjustingVariant] = useState<{ product: AdminProduct; variant: AdminProductVariant } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', 'all-for-inventory'],
    queryFn: () => productsApi.adminList({ pageSize: 200 }),
  })

  const products = data?.items ?? []
  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) ||
      p.variants?.some(v => v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q))
  })

  const totalVariants = products.flatMap(p => p.variants ?? []).length
  const zeroVariants = products.flatMap(p => p.variants ?? []).filter(v => v.stockOnHand === 0).length

  return (
    <div className="space-y-4">
      {/* Mini KPI */}
      <div className="flex gap-4 flex-wrap">
        <div className="text-xs text-gray-500"><span className="text-white font-bold">{totalVariants}</span> variants loaded</div>
        {zeroVariants > 0 && (
          <div className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> <span className="font-bold">{zeroVariants}</span> out of stock
          </div>
        )}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div className="p-5 border-b border-gray-900 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input className="dark-input w-full" style={{ paddingLeft: 40 }} placeholder="Search product / SKU..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading && <div className="flex items-center justify-center py-20 gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>}

        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className={th + " pl-5"}>Product</th>
                  <th className={th}>Variant / SKU</th>
                  <th className={th}>Retail Price</th>
                  <th className={th}>On Hand</th>
                  <th className={th}>Reserved</th>
                  <th className={th}>Available</th>
                  <th className={th}>Alert At</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-700 text-sm">No products found</td></tr>
                )}
                {filtered.flatMap(p =>
                  (p.variants?.length ? p.variants : []).map((v, vi) => {
                    const available = v.stockOnHand - v.stockReserved
                    const isLow = v.stockOnHand <= v.lowStockAlert && v.stockOnHand > 0
                    const isOut = v.stockOnHand === 0
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        className="hover:bg-white/[0.015] transition-colors">
                        <td className={td + " pl-5"}>
                          {vi === 0 ? (
                            <div className="font-semibold text-white text-sm leading-tight">{p.name}</div>
                          ) : (
                            <div className="text-gray-700 text-xs pl-2">↳</div>
                          )}
                        </td>
                        <td className={td}>
                          <div className="text-white text-sm">{v.name}</div>
                          <div className="text-xs text-gray-600 font-mono mt-0.5">{v.sku}</div>
                        </td>
                        <td className={td}>
                          <span className="text-sm font-semibold" style={{ color: GOLD }}>RM {v.retailPrice.toFixed(2)}</span>
                        </td>
                        <td className={td}>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg" style={{ color: isOut ? '#f87171' : isLow ? '#fbbf24' : '#4ade80' }}>
                              {v.stockOnHand}
                            </span>
                            {isOut && <span className="text-[10px] font-bold text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">OUT</span>}
                            {isLow && !isOut && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-900/20 px-1.5 py-0.5 rounded">LOW</span>}
                          </div>
                        </td>
                        <td className={td}><span className="text-xs text-gray-500">{v.stockReserved}</span></td>
                        <td className={td}>
                          <span className="text-sm font-bold" style={{ color: available <= 0 ? '#f87171' : '#4ade80' }}>
                            {Math.max(0, available)}
                          </span>
                        </td>
                        <td className={td}>
                          <span className="text-xs" style={{ color: isLow || isOut ? '#f87171' : '#6b7280' }}>
                            {v.lowStockAlert}
                            {(isLow || isOut) && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                          </span>
                        </td>
                        <td className={td}>
                          <button onClick={() => setAdjustingVariant({ product: p, variant: v })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{ background: 'rgba(233,30,140,0.07)', color: GOLD, border: `1px solid rgba(233,30,140,0.18)` }}>
                            <ArrowUpDown className="h-3 w-3" /> Adjust
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjustingVariant && (
        <AdjustModal
          productName={adjustingVariant.product.name}
          variantName={adjustingVariant.variant.name}
          variantId={adjustingVariant.variant.id}
          currentStock={adjustingVariant.variant.stockOnHand}
          onClose={() => setAdjustingVariant(null)} />
      )}
    </div>
  )
}

// ── Low Stock Tab ─────────────────────────────────────────────────────────────

function LowStockTab() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
  })
  const [adjusting, setAdjusting] = useState<{ productName: string; variantName: string; variantId: string; currentStock: number } | null>(null)

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div className="px-5 py-4 border-b border-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Variants at or below alert threshold</span>
          {data && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
              {data.length}
            </span>
          )}
        </div>
        <button onClick={() => refetch()} className="text-gray-600 hover:text-white transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && <div className="flex items-center justify-center py-10 gap-2 text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}

      {!isLoading && data?.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">All stock levels are healthy 🎉</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <th className={th + " pl-5"}>Product</th>
                <th className={th}>Variant</th>
                <th className={th}>SKU</th>
                <th className={th}>On Hand</th>
                <th className={th}>Alert Threshold</th>
                <th className={th}>Urgency</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => {
                const pct = item.lowStockAlert > 0 ? (item.stockOnHand / item.lowStockAlert) * 100 : 100
                const urgency = item.stockOnHand === 0 ? 'Out of Stock' : pct <= 30 ? 'Critical' : 'Low'
                const urgencyColor = item.stockOnHand === 0 ? '#f87171' : pct <= 30 ? '#fb923c' : '#fbbf24'
                return (
                  <tr key={item.variantId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.015] transition-colors">
                    <td className={td + " pl-5"}><span className="font-semibold text-white">{item.productName}</span></td>
                    <td className={td}><span className="text-gray-300">{item.variantName}</span></td>
                    <td className={td}><span className="font-mono text-xs text-gray-600">{item.sku}</span></td>
                    <td className={td}>
                      <div>
                        <span className="font-black text-lg" style={{ color: urgencyColor }}>{item.stockOnHand}</span>
                        <div className="mt-1 h-1 rounded-full bg-gray-800 w-16 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: urgencyColor }} />
                        </div>
                      </div>
                    </td>
                    <td className={td}><span className="text-gray-500">{item.lowStockAlert}</span></td>
                    <td className={td}>
                      <span className="text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider"
                        style={{ background: `${urgencyColor}18`, color: urgencyColor }}>
                        {urgency}
                      </span>
                    </td>
                    <td className={td}>
                      <button onClick={() => setAdjusting({ productName: item.productName, variantName: item.variantName, variantId: item.variantId, currentStock: item.stockOnHand })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <Plus className="h-3 w-3" /> Restock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {adjusting && (
        <AdjustModal
          productName={adjusting.productName}
          variantName={adjusting.variantName}
          variantId={adjusting.variantId}
          currentStock={adjusting.currentStock}
          defaultType="receive"
          onClose={() => { setAdjusting(null); refetch() }} />
      )}
    </div>
  )
}

// ── Movements Tab ─────────────────────────────────────────────────────────────

function MovementsTab() {
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'movements', typeFilter, page],
    queryFn: () => inventoryApi.listMovements({ type: typeFilter || undefined, page, pageSize: 25 }),
  })

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      {/* Filters */}
      <div className="px-5 py-4 border-b border-gray-900 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => { setTypeFilter(''); setPage(1) }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={typeFilter === '' ? { background: `linear-gradient(135deg, ${ROSE}, ${PINK})`, color: '#000' } : { color: '#6b7280' }}>
            All
          </button>
          {MOV_TYPES.map(t => (
            <button key={t.value} onClick={() => { setTypeFilter(t.value); setPage(1) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={typeFilter === t.value
                ? { background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }
                : { color: '#6b7280' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="flex items-center justify-center py-20 gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>}

      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <th className={th + " pl-5"}>Date/Time</th>
                <th className={th}>Product / Variant</th>
                <th className={th}>SKU</th>
                <th className={th}>Type</th>
                <th className={th}>Qty</th>
                <th className={th}>Before</th>
                <th className={th}>After</th>
                <th className={th}>Reference</th>
                <th className={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {(!data?.items?.length) && (
                <tr><td colSpan={9} className="py-12 text-center text-gray-700 text-sm">No movements found</td></tr>
              )}
              {data?.items?.map(m => {
                const mt = movStyle(m.type)
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.015] transition-colors">
                    <td className={td + " pl-5"}>
                      <div className="text-xs text-gray-300">{new Date(m.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-[10px] text-gray-600">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className={td}>
                      {m.variant?.product && <div className="text-[10px] text-gray-500">{(m.variant.product as { name?: string }).name ?? '—'}</div>}
                      <div className="text-sm text-white">{m.variant?.name ?? m.variantId.slice(0, 8)}</div>
                    </td>
                    <td className={td}><span className="font-mono text-xs text-gray-600">{m.variant?.sku ?? '—'}</span></td>
                    <td className={td}>
                      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: mt.color }}>
                        {mt.icon} {mt.label}
                      </span>
                    </td>
                    <td className={td}>
                      <span className="font-black text-sm" style={{ color: m.quantity > 0 ? '#4ade80' : '#f87171' }}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </span>
                    </td>
                    <td className={td}><span className="text-xs text-gray-500">{m.balanceBefore}</span></td>
                    <td className={td}><span className="text-xs font-semibold text-white">{m.balanceAfter}</span></td>
                    <td className={td}><span className="text-xs text-gray-600 font-mono">{m.reference || '—'}</span></td>
                    <td className={td}><span className="text-xs text-gray-500 max-w-[120px] truncate block">{m.note || '—'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <div className="px-5 py-4 border-t border-gray-900 flex items-center justify-between text-sm">
          <span className="text-gray-600">Total: <strong className="text-white">{data.total}</strong> movements</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>← Prev</button>
            <button disabled={!data?.items?.length || data.items.length < 25} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 disabled:opacity-30"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bulk Receive Tab (Enterprise PO Receipt) ──────────────────────────────────

interface BulkLine {
  id: string
  variantId: string
  variantLabel: string
  quantity: number
  note: string
  currentStock: number
}

function BulkReceiveTab() {
  const qc = useQueryClient()
  const [reference, setReference] = useState('')
  const [globalNote, setGlobalNote] = useState('')
  const [lines, setLines] = useState<BulkLine[]>([])
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState<{ count: number } | null>(null)

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products', 'all-for-bulk'],
    queryFn: () => productsApi.adminList({ pageSize: 200 }),
  })

  const allVariants = (productsData?.items ?? []).flatMap(p =>
    (p.variants ?? []).map(v => ({
      id: v.id,
      label: `${p.name} — ${v.name}`,
      sku: v.sku,
      stock: v.stockOnHand,
      product: p,
      variant: v,
    }))
  )

  const filteredVariants = allVariants.filter(v => {
    const q = search.toLowerCase()
    return !q || v.label.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q)
  }).filter(v => !lines.some(l => l.variantId === v.id))

  const addLine = (v: typeof allVariants[0]) => {
    setLines(prev => [...prev, {
      id: `${v.id}-${Date.now()}`,
      variantId: v.id,
      variantLabel: v.label,
      quantity: 1,
      note: '',
      currentStock: v.stock,
    }])
    setSearch('')
  }

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id))
  const updateLine = (id: string, field: 'quantity' | 'note', val: string | number) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l))

  const bulkReceive = useMutation({
    mutationFn: () => inventoryApi.bulkReceive({
      reference: reference.trim(),
      note: globalNote.trim(),
      items: lines.map(l => ({ variantId: l.variantId, quantity: l.quantity, note: l.note })),
    }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      setSuccess({ count: data.count })
      setLines([])
      setReference('')
      setGlobalNote('')
    },
  })

  return (
    <div className="space-y-5">
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-400">Bulk receive successful!</p>
            <p className="text-xs text-gray-400 mt-1">{success.count} variants updated. Stock has been increased.</p>
          </div>
          <button onClick={() => setSuccess(null)} className="ml-auto text-gray-600 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Left: PO details */}
        <div className="rounded-2xl p-5 space-y-5" style={card}>
          <div>
            <p className="text-sm font-black text-white mb-4">Purchase Order Details</p>
            <div className="space-y-4">
              <div>
                <Label>PO / Reference Number *</Label>
                <input className="dark-input font-mono" value={reference}
                  placeholder="PO-2026-001" onChange={e => setReference(e.target.value)} />
              </div>
              <div>
                <Label>General Note (optional)</Label>
                <textarea className="dark-textarea" rows={2} value={globalNote}
                  placeholder="e.g. Shipment from supplier ABC" onChange={e => setGlobalNote(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <Label>Add Product Variant</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input className="dark-input w-full pl-10" placeholder="Search by name or SKU..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {search && filteredVariants.length > 0 && (
              <div className="mt-2 rounded-xl border border-gray-800 overflow-hidden bg-[#0d0d0d] max-h-48 overflow-y-auto">
                {filteredVariants.slice(0, 10).map(v => (
                  <button key={v.id} onClick={() => addLine(v)}
                    className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-gray-900 last:border-0">
                    <div className="text-sm text-white">{v.label}</div>
                    <div className="text-xs text-gray-600 font-mono mt-0.5">{v.sku} · Stock: {v.stock}</div>
                  </button>
                ))}
              </div>
            )}
            {search && filteredVariants.length === 0 && (
              <p className="text-xs text-gray-600 mt-2 px-1">No matching variants found.</p>
            )}
          </div>
        </div>

        {/* Right: Lines */}
        <div className="rounded-2xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-white">Receive Lines</p>
            <span className="text-xs text-gray-600">{lines.length} item{lines.length !== 1 ? 's' : ''}</span>
          </div>

          {lines.length === 0 && (
            <div className="text-center py-10 text-gray-600">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">Add variants from the left panel</p>
            </div>
          )}

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {lines.map(l => (
              <div key={l.id} className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{l.variantLabel}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Current: {l.currentStock} → After: {l.currentStock + l.quantity}</p>
                  </div>
                  <button onClick={() => removeLine(l.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Qty to Receive</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateLine(l.id, 'quantity', Math.max(1, l.quantity - 1))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <input className="dark-input text-center w-16 font-bold text-sm" type="number" min={1}
                        value={l.quantity} onChange={e => updateLine(l.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} />
                      <button onClick={() => updateLine(l.id, 'quantity', l.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Line Note</p>
                    <input className="dark-input text-xs" value={l.note} placeholder="Optional..."
                      onChange={e => updateLine(l.id, 'note', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {lines.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-900">
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>Total lines: {lines.length}</span>
                <span>Total units: <strong className="text-green-400">+{lines.reduce((a, l) => a + l.quantity, 0)}</strong></span>
              </div>
              {bulkReceive.isError && (
                <p className="text-xs text-red-400 mb-3 p-3 rounded-xl bg-red-900/20 border border-red-800/30">
                  {(bulkReceive.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to submit.'}
                </p>
              )}
              <button disabled={bulkReceive.isPending || !reference.trim()}
                onClick={() => bulkReceive.mutate()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-black disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
                {bulkReceive.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {bulkReceive.isPending ? 'Processing…' : `Confirm Receipt (${lines.length} item${lines.length !== 1 ? 's' : ''})`}
              </button>
              {!reference.trim() && <p className="text-[10px] text-red-400 text-center mt-2">Please enter a PO reference number</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Adjust Tab ────────────────────────────────────────────────────────────────

function AdjustTab() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ product: AdminProduct; variant: AdminProductVariant } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', 'all-for-adjust'],
    queryFn: () => productsApi.adminList({ pageSize: 200 }),
  })

  const filtered = (data?.items ?? []).filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.variants?.some(v => v.sku.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
  })

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {/* Left: pick variant */}
      <div style={{ ...card, padding: 20 }}>
        <div className="mb-4">
          <Label>Select Variant to Adjust</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input className="dark-input w-full" style={{ paddingLeft: 40 }} placeholder="Search product / SKU..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading && <div className="text-center py-8 text-gray-600"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>}

        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {filtered.flatMap(p =>
            (p.variants ?? []).map(v => (
              <button key={v.id} onClick={() => setSelected({ product: p, variant: v })}
                className="w-full text-left px-4 py-3 rounded-xl transition-all"
                style={{
                  border: selected?.variant.id === v.id ? `1.5px solid ${GOLD}` : '1px solid rgba(255,255,255,0.07)',
                  background: selected?.variant.id === v.id ? 'rgba(233,30,140,0.05)' : 'rgba(255,255,255,0.02)',
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{p.name} — {v.name}</div>
                    <div className="text-xs text-gray-600 font-mono mt-0.5">{v.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: v.stockOnHand <= v.lowStockAlert ? '#f87171' : '#4ade80' }}>
                      {v.stockOnHand}
                    </div>
                    <div className="text-xs text-gray-700">in stock</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: adjust form */}
      <div>
        {selected ? (
          <div style={{ ...card, padding: 20 }}>
            <AdjustStockForm
              productName={selected.product.name}
              variantName={selected.variant.name}
              variantId={selected.variant.id}
              currentStock={selected.variant.stockOnHand}
              onSuccess={() => setSelected(null)} />
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <div className="text-center text-gray-700">
              <ArrowUpDown className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a variant to adjust</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Adjust Stock Modal ─────────────────────────────────────────────────────────

function AdjustModal({ productName, variantName, variantId, currentStock, defaultType, onClose }: {
  productName: string; variantName: string; variantId: string; currentStock: number
  defaultType?: string; onClose: () => void
}) {
  const qc = useQueryClient()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md" style={{ background: '#111', border: '1px solid rgba(233,30,140,0.18)', borderRadius: 20, overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h3 className="font-black text-white">Adjust Stock</h3>
            <p className="text-xs text-gray-600 mt-0.5">{productName} — {variantName}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5">
          <AdjustStockForm
            productName={productName}
            variantName={variantName}
            variantId={variantId}
            currentStock={currentStock}
            defaultType={defaultType}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['admin', 'products'] })
              qc.invalidateQueries({ queryKey: ['admin', 'inventory'] })
              onClose()
            }} />
        </div>
      </div>
    </div>
  )
}

// ── Shared Adjust Form ────────────────────────────────────────────────────────

function AdjustStockForm({ productName, variantName, variantId, currentStock, defaultType = 'adjust', onSuccess }: {
  productName: string; variantName: string; variantId: string; currentStock: number
  defaultType?: string; onSuccess: () => void
}) {
  const qc = useQueryClient()
  const [type, setType] = useState(defaultType)
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')

  const adjust = useMutation({
    mutationFn: () => inventoryApi.adjustStock({
      variantId, type,
      quantity: type === 'sale' || type === 'write_off' ? -(Math.abs(parseInt(quantity) || 0)) : Math.abs(parseInt(quantity) || 0),
      reference, note,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      onSuccess()
    },
  })

  const qty = parseInt(quantity) || 0
  const isNegative = type === 'sale' || type === 'write_off'
  const projected = currentStock + (isNegative ? -qty : qty)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 px-3 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Package className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
        <div>
          <p className="text-sm font-semibold text-white">{productName}</p>
          <p className="text-xs text-gray-500">{variantName}</p>
          <p className="text-xs mt-1" style={{ color: currentStock <= 5 ? '#f87171' : '#4ade80' }}>
            Current stock: <strong>{currentStock}</strong>
          </p>
        </div>
      </div>

      <div>
        <Label>Movement Type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {MOV_TYPES.map(mt => (
            <button key={mt.value} onClick={() => setType(mt.value)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={type === mt.value
                ? { background: `${mt.color}20`, color: mt.color, border: `1.5px solid ${mt.color}40` }
                : { color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
              {mt.icon} {mt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Quantity *</Label>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => setQuantity(q => String(Math.max(1, parseInt(q) || 1) - 1))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Minus className="h-4 w-4" />
          </button>
          <input className="dark-input flex-1 text-center font-bold text-lg" type="number" min={1}
            value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
          <button onClick={() => setQuantity(q => String((parseInt(q) || 0) + 1))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {qty > 0 && (
          <div className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-gray-500">After adjustment: </span>
            <strong style={{ color: projected < 0 ? '#f87171' : projected <= 5 ? '#fbbf24' : '#4ade80' }}>
              {projected}
            </strong>
            {projected < 0 && <span className="text-red-400 ml-2">⚠ Would go negative!</span>}
          </div>
        )}
      </div>

      <div>
        <Label>Reference / PO Number</Label>
        <input className="dark-input mt-1 font-mono" placeholder="PO-2026-001" value={reference} onChange={e => setReference(e.target.value)} />
      </div>

      <div>
        <Label>Note</Label>
        <textarea className="dark-textarea mt-1" rows={2} placeholder="Reason for adjustment..." value={note} onChange={e => setNote(e.target.value)} />
      </div>

      {adjust.isError && <p className="text-xs text-red-400">{(adjust.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to adjust stock.'}</p>}
      <button disabled={adjust.isPending || !quantity || qty <= 0 || projected < 0} onClick={() => adjust.mutate()}
        className="w-full py-2.5 rounded-xl text-sm font-black text-black disabled:opacity-60 transition-all"
        style={{ background: `linear-gradient(135deg, ${ROSE}, ${PINK})` }}>
        {adjust.isPending ? 'Processing...' : `Confirm Adjustment`}
      </button>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{children}</p>
}
