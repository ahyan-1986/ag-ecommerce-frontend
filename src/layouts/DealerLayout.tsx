import { type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, User, LogOut, Sparkles, Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LanguageSwitcher } from '../contexts/LanguageContext'

const OLIVE_GREEN = '#3A5D36'
const GOLD        = '#C5963B'
const LOGO        = '/images/logo.png'

const navItems = [
  { to: '/dealer',         label: 'Papan Pemuka',       icon: LayoutDashboard, end: true },
  { to: '/dealer/orders',  label: 'Pesanan Borong',     icon: ShoppingCart },
  { to: '/dealer/wallet',  label: 'Dompet Komisen',     icon: Wallet },
  { to: '/dealer/profile', label: 'Profil Usahawan',    icon: User },
]

export function DealerLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0F1710' }}>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col"
        style={{ background: '#142015', borderRight: '1px solid rgba(197,150,59,0.15)' }}>

        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO} alt="Asian Mum" className="h-9 w-auto rounded-lg bg-white/90 p-1 object-contain" />
            <div>
              <p className="text-sm font-black text-white leading-none">Asian Mum</p>
              <p className="text-[9px] text-amber-300 font-bold uppercase tracking-widest mt-0.5">Rakan Niaga</p>
            </div>
          </Link>
          <LanguageSwitcher dark />
        </div>

        {/* Consultant badge */}
        <div className="px-5 py-3">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(197,150,59,0.12)', color: '#FCD34D', border: '1px solid rgba(197,150,59,0.25)' }}>
            <Sparkles className="h-3 w-3 text-amber-400" /> Portal Usahawan
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={({ isActive }) => isActive
                ? { background: `linear-gradient(135deg, ${OLIVE_GREEN}, #4E7749)`, color: '#fff', borderLeft: `3px solid ${GOLD}` }
                : { color: '#94A3B8' }
              }
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ background: `linear-gradient(135deg, ${OLIVE_GREEN}, ${GOLD})` }}>
              {user?.firstName?.[0] ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 transition-colors w-full px-3 py-2 rounded-xl border border-rose-500/20">
            <LogOut className="h-3.5 w-3.5" /> Log Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6" style={{ background: '#0B120C', color: '#fff' }}>
        {children}
      </main>
    </div>
  )
}
