import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { walletApi } from '../../api/wallet'
import { Wallet, ArrowDownRight, ArrowUpRight, History, CreditCard, Sparkles } from 'lucide-react'

const OLIVE = '#2F4C2C'
const GOLD  = '#C5963B'

export default function WalletPage() {
  const [page, setPage] = useState(1)

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['myWallet'],
    queryFn: walletApi.getMyWallet,
  })

  const { data: txData, isLoading: loadingTxs } = useQuery({
    queryKey: ['myWalletTxs', page],
    queryFn: () => walletApi.getMyTransactions({ page, pageSize: 10 }),
  })

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dompet Digital Saya</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pantau baki tunai e-dompet, komisen affiliate, dan mata ganjaran</p>
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* RM Cash / Commission Balance */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${OLIVE}, #4E7749)` }}>
            <CreditCard className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Baki Tunai Dompet (RM)</p>
            {loadingWallet ? (
              <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-emerald-950">
                RM {wallet?.rmBalance?.toFixed(2) || '0.00'}
              </p>
            )}
          </div>
        </div>

        {/* Wellness Points Balance */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #D4AF37)` }}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mata Ganjaran (Points)</p>
            {loadingWallet ? (
              <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-gray-900">
                {wallet?.pointsBalance?.toLocaleString() || '0'} PTS
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl shadow-xs border border-emerald-900/10 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-800" /> Sejarah Transaksi Dompet
          </h2>
        </div>

        {loadingTxs ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !txData?.items?.length ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <Wallet className="h-10 w-10 mx-auto text-gray-300 mb-3 opacity-60" />
            <p>Tiada rekod transaksi dompet ditemui.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {txData.items.map((tx: any) => {
              const isCredit = tx.type === 'credit' || tx.type === 'deposit' || tx.type === 'commission'
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isCredit ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{tx.description || tx.type}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('ms-MY', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isCredit ? '+' : '-'} RM {Math.abs(tx.amount || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize">{tx.status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {(txData?.totalPages ?? 1) > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-gray-500">Muka {page} / {txData?.totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(txData?.totalPages ?? 1, p + 1))}
              disabled={page >= (txData?.totalPages ?? 1)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold disabled:opacity-50"
            >
              Seterusnya
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
