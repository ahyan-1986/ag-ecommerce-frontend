import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/navigation/AppHeader'
import { AscendLogo } from '../components/brand/AscendLogo'

export function PublicStoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>

      {/* Bright, Energetic Dopamine Footer (No dark background!) */}
      <footer className="mt-auto bg-gradient-to-br from-[#FFF4F1] via-[#FFFBEB] to-[#ECFEF9] border-t-2 border-orange-100 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-orange-200/60 text-sm">
            <div className="md:col-span-2 space-y-3">
              <AscendLogo size="md" showTagline />
              <p className="text-slate-600 max-w-sm leading-relaxed text-xs">
                Ascend Group blends vibrant daily wellness with a transparent, rewarding 4-tier loyalty &amp; referral circle. Shop, share, and ascend together.
              </p>
            </div>
            <div>
              <p className="font-extrabold text-[#FF5A36] uppercase tracking-wider text-xs mb-3">Explore</p>
              <ul className="space-y-2 text-slate-600 font-medium text-xs">
                <li><Link to="/shop" className="hover:text-[#FF5A36] transition">Shop All Products</Link></li>
                <li><Link to="/membership" className="hover:text-[#FF5A36] transition">Ascend Circle Tiers</Link></li>
                <li><Link to="/cart" className="hover:text-[#FF5A36] transition">Shopping Cart</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-extrabold text-[#00A37B] uppercase tracking-wider text-xs mb-3">Member Portal</p>
              <ul className="space-y-2 text-slate-600 font-medium text-xs">
                <li><Link to="/dashboard" className="hover:text-[#00A37B] transition">My Dashboard</Link></li>
                <li><Link to="/vouchers" className="hover:text-[#00A37B] transition">My Vouchers</Link></li>
                <li><Link to="/withdrawals" className="hover:text-[#00A37B] transition">Redeem Rewards</Link></li>
                <li><Link to="/register" className="hover:text-[#00A37B] transition">Join Ascend Group</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-medium">
            <p>© {new Date().getFullYear()} Ascend Group Sdn. Bhd. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Loyalty Rules</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
