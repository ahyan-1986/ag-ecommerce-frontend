import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Megaphone,
  UserCircle,
  UserPlus,
  ShoppingBag,
  Ticket,
  Gift,
  ChevronDown,
  Users,
  Activity,
  Banknote,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AppHeader } from '../components/navigation/AppHeader'
import { TierBadge } from '../components/tier/TierBadge'

export function CustomerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  const loyaltyRoutes = ['/loyalty', '/referral', '/wallet', '/withdrawals']
  const isInLoyalty = loyaltyRoutes.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))
  const [loyaltyOpen, setLoyaltyOpen] = useState(true)

  const registerFriendLink = user?.referralCode ? `/register/${user.referralCode}` : '/register'

  const topItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
    { to: registerFriendLink, label: 'Register a Friend', icon: UserPlus },
    { to: '/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/vouchers', label: 'My Vouchers', icon: Ticket },
  ]

  const loyaltyChildren = [
    { to: '/loyalty', label: 'Loyalty Overview', icon: Gift },
    { to: '/referral', label: 'My Ascend Circle', icon: Users },
    { to: '/wallet', label: 'Recent Loyalty Points Activities', icon: Activity },
    { to: '/withdrawals', label: 'Redeem Rewards', icon: Banknote },
  ]

  const mobileBarItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/shop', label: 'Shop', icon: ShoppingBag },
    { to: '/vouchers', label: 'Vouchers', icon: Ticket },
    { to: '/loyalty', label: 'Rewards', icon: Gift },
    { to: '/withdrawals', label: 'Redeem', icon: Banknote },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <AppHeader />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-7 items-start">
          {/* ── Aameba-Aligned Member Sidebar (Bright Dopamine Card) ─────────── */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-32 bg-white rounded-3xl border-2 border-orange-100/80 shadow-soft p-5">
            {user && (
              <div className="mb-5 pb-4 border-b border-orange-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5A36] via-[#FFB800] to-[#00C896] text-white font-black text-lg flex items-center justify-center shadow-coral-sm shrink-0">
                  {(user.firstName?.[0] || 'A').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <TierBadge rank={user.memberRank || user.highestRank} size="xs" />
                    {user.memberCode && (
                      <span className="text-[10px] font-bold text-slate-400">{user.memberCode}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              {topItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF5A36] to-[#FF8A00] text-white shadow-coral-sm'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-[#FF5A36]'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}

              {/* Collapsible Loyalty & Rewards Group (Exact Aameba origin/dev order) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setLoyaltyOpen(!loyaltyOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                    isInLoyalty
                      ? 'bg-amber-50 text-[#E84420] border border-amber-200/80'
                      : 'text-slate-700 hover:bg-orange-50 hover:text-[#FF5A36]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Gift className="w-4 h-4 shrink-0 text-[#FFB800]" />
                    <span>Loyalty &amp; Rewards</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${loyaltyOpen ? 'rotate-180' : ''}`} />
                </button>

                {loyaltyOpen && (
                  <div className="mt-1.5 ml-3 pl-3 border-l-2 border-orange-100 space-y-1">
                    {loyaltyChildren.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#00C896] to-[#06B6D4] text-white shadow-mint-sm'
                              : 'text-slate-600 hover:bg-emerald-50 hover:text-[#00A37B]'
                          }`
                        }
                      >
                        <child.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-snug">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </aside>

          {/* ── Main Content ─────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ─────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-orange-100 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {mobileBarItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
                isActive ? 'text-[#FF5A36] scale-105' : 'text-slate-400 hover:text-[#FF5A36]'
              }`
            }
          >
            <item.icon className="h-5 w-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
