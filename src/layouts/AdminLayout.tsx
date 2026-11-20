import { type ReactNode, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3,
  Tag, GitBranch, MessageSquare, Bot, Settings, LogOut, Menu, X,
  Truck, ExternalLink, Activity, Wallet, Image, Megaphone,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AscendLogo } from '../components/brand/AscendLogo'

const navItems = [
  { to: '/admin',               label: 'Dashboard',           icon: LayoutDashboard, end: true },
  { to: '/admin/announcements', label: 'Announcements',       icon: Megaphone },
  { to: '/admin/banners',       label: 'Promo Banners',       icon: Image },
  { to: '/admin/customers',     label: 'Members & CRM',       icon: Users },
  { to: '/admin/dealers',       label: 'Dealers',             icon: Users },
  { to: '/admin/products',      label: 'Product Catalog',     icon: Package },
  { to: '/admin/orders',        label: 'Orders',              icon: ShoppingCart },
  { to: '/admin/inventory',     label: 'Inventory & Stock',   icon: BarChart3 },
  { to: '/admin/shipping',      label: 'Shipping Rates',      icon: Truck },
  { to: '/admin/vouchers',      label: 'Vouchers',            icon: Tag },
  { to: '/admin/wallets',       label: 'Wallets & Payouts',   icon: Wallet },
  { to: '/admin/affiliate',     label: 'MLM & Bonus Engine',  icon: GitBranch },
  { to: '/admin/whatsapp',      label: 'WhatsApp Marketing',  icon: MessageSquare },
  { to: '/admin/ai',            label: 'AI Analytics',        icon: Bot },
  { to: '/admin/payment-logs',  label: 'Payment Logs',        icon: Activity },
  { to: '/admin/settings',      label: 'System Settings',     icon: Settings },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFDF9]">
      {/* Bright Dopamine Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r-2 border-orange-100 shadow-soft transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-orange-100">
          <Link to="/" className="shrink-0">
            <AscendLogo size="sm" />
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <span className="block text-center text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 text-[#FF5A36] border border-orange-200/80">
            Ascend Admin Central
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF5A36] to-[#FF8A00] text-white shadow-coral-sm'
                    : 'text-slate-600 hover:bg-orange-50 hover:text-[#FF5A36]'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-orange-100 space-y-1.5">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#00A37B] bg-emerald-50 hover:bg-emerald-100 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Live Storefront
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out ({user?.firstName})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-orange-100 px-4 sm:px-6 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-orange-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF5A36]">
              {user?.email}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
