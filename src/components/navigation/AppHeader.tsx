import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, LogOut, Sparkles, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage, LanguageSwitcher } from '../../contexts/LanguageContext'
import { ordersApi } from '../../api/orders'
import { AscendLogo } from '../brand/AscendLogo'
import { TierBadge } from '../tier/TierBadge'

export function AppHeader() {
  const { user, logout } = useAuth()
  const { isZh } = useLanguage()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: ordersApi.getCart,
    enabled: !!user,
    retry: false,
  })
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  const navLinks = [
    { to: '/', label: isZh ? '首页' : 'Home' },
    { to: '/shop', label: isZh ? '活力商城' : 'Shop' },
    { to: '/membership', label: isZh ? 'Ascend 圈层' : 'Ascend Circle' },
  ]

  return (
    <header className="sticky top-0 z-40">
      {/* Vibrant Dopamine Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#FF5A36] via-[#FFB800] to-[#00C896] text-white text-[11px] sm:text-xs font-extrabold tracking-wide py-2 px-4 text-center shadow-sm">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          {isZh
            ? '每笔订单赚取 15% 积分回馈 • 分享 2 代好友各赚 15% • 晋升三星领袖享高达 45% 领导奖金！'
            : 'Earn 15% Loyalty Points on Every Order • Share & Earn 15% Across 2 Levels • Climb to Three Star for 45% Leadership Bonus!'}
        </span>
      </div>

      {/* Crisp Bright White Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-orange-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <AscendLogo size="md" showTagline />
          </Link>

          {/* Desktop Center Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-orange-50 text-[#FF5A36]'
                      : 'text-slate-600 hover:text-[#FF5A36] hover:bg-orange-50/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />

            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-orange-50 hover:bg-orange-100 text-[#FF5A36] transition-all"
              title={isZh ? '购物车' : 'Shopping Cart'}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-[#FF5A36] to-[#EC4899] text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isZh ? '后台管理' : 'Admin'}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/80 hover:border-[#FF5A36] transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF5A36] to-[#FFB800] text-white font-black text-xs flex items-center justify-center">
                    {user.firstName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-extrabold text-slate-800">{user.firstName}</div>
                  </div>
                  <TierBadge rank={user.memberRank || user.highestRank} size="xs" />
                </Link>
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                  title={isZh ? '退出登录' : 'Sign Out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-bold text-slate-700 hover:text-[#FF5A36] transition"
                >
                  {isZh ? '登录' : 'Sign In'}
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-5 !text-xs">
                  {isZh ? '免费注册' : 'Join Free'}
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-orange-50"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-orange-100 px-4 py-4 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-[#FF5A36]"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-orange-50 text-[#FF5A36]"
                >
                  <LayoutDashboard className="w-4 h-4" /> {isZh ? '会员中心' : 'My Account Dashboard'}
                </Link>
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-violet-50 text-violet-700"
                  >
                    <ShieldCheck className="w-4 h-4" /> {isZh ? '管理后台' : 'Admin Backoffice'}
                  </Link>
                )}
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-full border-2 border-orange-200 text-sm font-bold text-[#FF5A36]"
                >
                  {isZh ? '登录' : 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center btn-primary !py-2.5 !text-sm"
                >
                  {isZh ? '免费注册' : 'Join Free'}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
