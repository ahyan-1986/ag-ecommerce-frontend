import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import type { UserRole } from './types'
import LandingPage from './pages/LandingPage'
import MembershipPage from './pages/MembershipPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Layouts
import { AdminLayout } from './layouts/AdminLayout'
import { CustomerLayout } from './layouts/CustomerLayout'
import { DealerLayout } from './layouts/DealerLayout'
import { PublicStoreLayout } from './layouts/PublicStoreLayout'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminDealers from './pages/admin/AdminDealers'
import AdminBanners from './pages/admin/AdminBanners'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminInventory from './pages/admin/AdminInventory'
import AdminShipping from './pages/admin/AdminShipping'
import AdminVouchers from './pages/admin/AdminVouchers'
import AdminAffiliate from './pages/admin/AdminAffiliate'
import AdminWhatsApp from './pages/admin/AdminWhatsApp'
import AdminAIAnalytics from './pages/admin/AdminAIAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminWallets from './pages/admin/AdminWallets'
import AdminPaymentLogs from './pages/admin/AdminPaymentLogs'

// Customer & Member Portal pages (Aameba origin/dev flow)
import CustomerDashboard from './pages/customer/CustomerDashboard'
import ShopPage from './pages/customer/ShopPage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrdersPage from './pages/customer/OrdersPage'
import WalletPage from './pages/customer/WalletPage'
import OrderReceiptPage from './pages/customer/OrderReceiptPage'
import ReferralPage from './pages/customer/ReferralPage'
import AIChatPage from './pages/customer/AIChatPage'
import ProfilePage from './pages/customer/ProfilePage'
import VouchersPage from './pages/customer/VouchersPage'
import LoyaltyOverviewPage from './pages/customer/LoyaltyOverviewPage'
import WithdrawalsPage from './pages/customer/WithdrawalsPage'
import AnnouncementsPage from './pages/customer/AnnouncementsPage'

// Dealer pages
import DealerDashboard from './pages/dealer/DealerDashboard'
import DealerOrders from './pages/dealer/DealerOrders'
import DealerProfile from './pages/dealer/DealerProfile'

function RequireRole({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFDF9]">
        <span className="animate-spin h-9 w-9 rounded-full border-4 border-[#FF5A36] border-t-transparent" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { loading } = useAuth()
  if (loading) return null
  return <LandingPage />
}

const MEMBER_ROLES: UserRole[] = ['customer', 'dealer', 'admin', 'super_admin']
const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin']

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Public & Landing */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/:referralCode" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Public E-Commerce Storefront */}
          <Route path="/shop" element={<PublicStoreLayout><ShopPage /></PublicStoreLayout>} />
          <Route path="/products/:slug" element={<PublicStoreLayout><ProductDetailPage /></PublicStoreLayout>} />
          <Route path="/cart" element={<PublicStoreLayout><CartPage /></PublicStoreLayout>} />

          {/* Admin routes */}
          <Route path="/admin" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminDashboard /></AdminLayout></RequireRole>} />
          <Route path="/admin/customers" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminCustomers /></AdminLayout></RequireRole>} />
          <Route path="/admin/dealers" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminDealers /></AdminLayout></RequireRole>} />
          <Route path="/admin/banners" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminBanners /></AdminLayout></RequireRole>} />
          <Route path="/admin/announcements" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminAnnouncements /></AdminLayout></RequireRole>} />
          <Route path="/admin/products" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminProducts /></AdminLayout></RequireRole>} />
          <Route path="/admin/orders" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminOrders /></AdminLayout></RequireRole>} />
          <Route path="/admin/inventory" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminInventory /></AdminLayout></RequireRole>} />
          <Route path="/admin/shipping" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminShipping /></AdminLayout></RequireRole>} />
          <Route path="/admin/wallets" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminWallets /></AdminLayout></RequireRole>} />
          <Route path="/admin/vouchers" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminVouchers /></AdminLayout></RequireRole>} />
          <Route path="/admin/affiliate" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminAffiliate /></AdminLayout></RequireRole>} />
          <Route path="/admin/whatsapp" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminWhatsApp /></AdminLayout></RequireRole>} />
          <Route path="/admin/ai" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminAIAnalytics /></AdminLayout></RequireRole>} />
          <Route path="/admin/settings" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminSettings /></AdminLayout></RequireRole>} />
          <Route path="/admin/payment-logs" element={<RequireRole roles={ADMIN_ROLES}><AdminLayout><AdminPaymentLogs /></AdminLayout></RequireRole>} />

          {/* Dealer routes */}
          <Route path="/dealer" element={<RequireRole roles={['dealer']}><DealerLayout><DealerDashboard /></DealerLayout></RequireRole>} />
          <Route path="/dealer/orders" element={<RequireRole roles={['dealer']}><DealerLayout><DealerOrders /></DealerLayout></RequireRole>} />
          <Route path="/dealer/wallet" element={<RequireRole roles={['dealer']}><DealerLayout><WalletPage /></DealerLayout></RequireRole>} />
          <Route path="/dealer/profile" element={<RequireRole roles={['dealer']}><DealerLayout><DealerProfile /></DealerLayout></RequireRole>} />

          {/* Member Portal routes (Exact Aameba origin/dev flow) */}
          <Route path="/dashboard" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><CustomerDashboard /></CustomerLayout></RequireRole>} />
          <Route path="/announcements" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><AnnouncementsPage /></CustomerLayout></RequireRole>} />
          <Route path="/vouchers" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><VouchersPage /></CustomerLayout></RequireRole>} />
          <Route path="/loyalty" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><LoyaltyOverviewPage /></CustomerLayout></RequireRole>} />
          <Route path="/withdrawals" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><WithdrawalsPage /></CustomerLayout></RequireRole>} />
          <Route path="/checkout" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><CheckoutPage /></CustomerLayout></RequireRole>} />
          <Route path="/orders" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><OrdersPage /></CustomerLayout></RequireRole>} />
          <Route path="/orders/:id/receipt" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><OrderReceiptPage /></CustomerLayout></RequireRole>} />
          <Route path="/wallet" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><WalletPage /></CustomerLayout></RequireRole>} />
          <Route path="/referral" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><ReferralPage /></CustomerLayout></RequireRole>} />
          <Route path="/ai-chat" element={<CustomerLayout><AIChatPage /></CustomerLayout>} />
          <Route path="/profile" element={<RequireRole roles={MEMBER_ROLES}><CustomerLayout><ProfilePage /></CustomerLayout></RequireRole>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  )
}
