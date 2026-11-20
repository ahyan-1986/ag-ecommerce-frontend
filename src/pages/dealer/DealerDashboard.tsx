import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { affiliateApi } from '../../api/affiliate'
import { ShoppingCart, Users, Crown, TrendingUp, Award } from 'lucide-react'

const OLIVE_GREEN = '#3A5D36'

export default function DealerDashboard() {
  const { user } = useAuth()
  
  const { data: networkStats } = useQuery({
    queryKey: ['dealer-network-stats'],
    queryFn: affiliateApi.myNetworkStats,
  })

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, ${OLIVE_GREEN}, #253C23)` }}
      >
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-amber-400/10 blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-amber-300" />
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Portal Rakan Niaga Asian Mum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Selamat Datang, Usahawan {user?.firstName}! 🌿
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
            Pantau pesanan borong, prestasi rangkaian 3-peringkat, dan baki komisen tajaan anda di sini.
          </p>
        </div>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Bulk Order */}
        <Link
          to="/dealer/orders"
          className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all hover:scale-[1.02] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-700/50 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-600 transition-colors">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Pesanan Borong</p>
            <p className="text-xs text-gray-400 mt-0.5">Beli produk Asian Mum pada harga diskaun usahawan</p>
          </div>
        </Link>

        {/* Status */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Peringkat Rakan Niaga</p>
            <p className="text-xs text-emerald-300 font-semibold mt-0.5">
              {networkStats?.levelRates?.[0] ? `Komisen Terus: ${networkStats.levelRates[0]}%` : 'Usahawan Aktif'}
            </p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jumlah Komisen Terkumpul</p>
            <p className="text-xl font-black text-amber-300">
              RM {(networkStats?.totalEarned || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Downline Network Overview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Kembangkan Pasukan Usahawan Anda</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {networkStats?.totalDownline
                  ? `Anda mempunyai ${networkStats.totalDownline} rakan niaga aktif dalam rangkaian.`
                  : 'Ajak rakan atau suri rumah lain untuk menjadi pengedar dan nikmati komisen overriding 3 peringkat.'}
              </p>
            </div>
          </div>
          <Link
            to="/referral"
            className="btn-gold py-2.5 px-6 text-xs font-bold text-gray-900 shrink-0 whitespace-nowrap"
          >
            Kongsi Pautan Rujukan
          </Link>
        </div>

      </div>

    </div>
  )
}
