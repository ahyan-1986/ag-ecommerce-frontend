import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../api/orders'
import { announcementApi } from '../../api/announcement'
import { ShoppingCart, Users, Package, TrendingUp, Clock, AlertTriangle, Megaphone, Download } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

// Use constant colors for the announcement widget
const ROSE = '#3A5D36'
const PINK = '#ff7eb3'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: ordersApi.dashboardStats,
  })

  const { data: announcements = [] } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: announcementApi.getActive,
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
  if (!stats) return null

  const monthlyRevenue = stats.monthlyRevenue ?? []

  const statCards = [
    { label: 'Total Orders',    value: stats.totalOrders,      icon: ShoppingCart,   color: 'text-blue-400' },
    { label: 'Total Revenue',   value: `RM ${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Customers',       value: stats.totalCustomers,   icon: Users,          color: 'text-purple-400' },
    { label: 'Consultants',     value: stats.totalDealers,     icon: Package,        color: 'text-pink-400' },
    { label: 'Pending Orders',  value: stats.pendingOrders,    icon: Clock,          color: 'text-orange-400' },
    { label: 'Low Stock Items', value: stats.lowStockProducts, icon: AlertTriangle,  color: 'text-red-400' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`p-3 rounded-xl ${card.color}`}
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className="p-5 rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: ROSE }} />
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="h-4 w-4" style={{ color: ROSE }} />
                <h3 className="font-bold text-white text-sm">{ann.title}</h3>
                <span className="text-[10px] text-gray-500 ml-auto">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-400 prose-p:text-sm prose-a:text-pink-400 hover:prose-a:text-pink-300 leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: ann.content }} />
              {ann.attachmentUrl && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <a href={ann.attachmentUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(233,30,140,0.1)', color: PINK }}>
                    <Download className="h-3.5 w-3.5" />
                    Download {ann.attachmentName || 'Attachment'}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-sm font-semibold text-gray-400 mb-4 tracking-widest uppercase">Monthly Revenue</h2>
        {monthlyRevenue.length === 0
          ? <p className="text-gray-700 text-sm py-10 text-center">No revenue data yet</p>
          : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ background: '#1F0A18', border: '1px solid rgba(233,30,140,0.25)', borderRadius: 8 }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(v) => [`RM ${Number(v).toFixed(2)}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3A5D36" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )
        }
      </div>
    </div>
  )
}
