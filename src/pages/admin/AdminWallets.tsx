import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletApi } from '../../api/wallet'
import { Search, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'

export default function AdminWallets() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [adjustingUser, setAdjustingUser] = useState<any>(null)
  const [adjustForm, setAdjustForm] = useState({ amount: '', balanceType: 'POINTS' as 'POINTS' | 'RM', description: '' })
  const [adjustError, setAdjustError] = useState('')

  const { data: walletsData, isLoading: loadingWallets } = useQuery({
    queryKey: ['admin-wallets', page, debouncedSearch],
    queryFn: () => walletApi.listWallets({ page, pageSize: 10, search: debouncedSearch }),
  })

  const { data: txsData, isLoading: loadingTxs } = useQuery({
    queryKey: ['admin-wallet-txs', selectedWalletId],
    queryFn: () => walletApi.adminListTransactions({ walletId: selectedWalletId || undefined, page: 1, pageSize: 50 }),
    enabled: !!selectedWalletId,
  })

  const adjustMutation = useMutation({
    mutationFn: () => walletApi.adminAdjustBalance(adjustingUser.userId, {
      amount: parseFloat(adjustForm.amount),
      balanceType: adjustForm.balanceType,
      description: adjustForm.description,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] })
      if (selectedWalletId) queryClient.invalidateQueries({ queryKey: ['admin-wallet-txs', selectedWalletId] })
      setAdjustingUser(null)
      setAdjustForm({ amount: '', balanceType: 'POINTS', description: '' })
      setAdjustError('')
    },
    onError: (err: any) => {
      setAdjustError(err.response?.data?.error || 'Failed to adjust balance')
    }
  })

  // Handle Search debounce
  const handleSearch = (e: any) => {
    setSearch(e.target.value)
    setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Member Wallets</h1>
          <p className="text-gray-400 mt-1">Manage e-wallet balances and transactions for all members.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Col: Wallets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={handleSearch}
              className="bg-transparent text-white border-none focus:ring-0 w-full placeholder:text-gray-500"
            />
          </div>

          <div className="bg-[#1A1A1A] rounded-xl border border-[#333] overflow-hidden">
            {loadingWallets ? (
              <div className="p-10 flex justify-center"><RefreshCw className="h-6 w-6 animate-spin text-[#3A5D36]" /></div>
            ) : !walletsData?.items?.length ? (
              <div className="p-10 text-center text-gray-500">No wallets found</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#111] text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {walletsData.items.map((w: any) => (
                    <tr key={w.userId} 
                      onClick={() => setSelectedWalletId(w.id)}
                      className={`hover:bg-[#222] cursor-pointer transition-colors ${selectedWalletId === w.id ? 'bg-[#2a1a25]' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{w.user?.firstName} {w.user?.lastName}</div>
                        <div className="text-xs text-gray-500">{w.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-[#C5963B]">{w.pointsBalance.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAdjustingUser(w) }}
                          className="px-3 py-1 bg-[#3A5D36]/10 text-[#3A5D36] hover:bg-[#3A5D36]/20 rounded-md text-xs font-bold transition-colors"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {walletsData && walletsData.total > 10 && (
              <div className="p-4 border-t border-[#333] flex justify-between items-center text-xs text-gray-500">
                <span>Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, walletsData.total)} of {walletsData.total}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded bg-[#333] hover:bg-[#444] disabled:opacity-50">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= walletsData.total} className="px-2 py-1 rounded bg-[#333] hover:bg-[#444] disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Details & Transactions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1A1A1A] rounded-xl border border-[#333] p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#3A5D36]" /> Recent Transactions
            </h2>
            
            {!selectedWalletId ? (
              <div className="py-10 text-center text-gray-500 text-sm border-2 border-dashed border-[#333] rounded-xl">
                Select a wallet to view transactions
              </div>
            ) : loadingTxs ? (
              <div className="py-10 flex justify-center"><RefreshCw className="h-6 w-6 animate-spin text-[#3A5D36]" /></div>
            ) : !txsData?.items?.length ? (
              <div className="py-10 text-center text-gray-500 text-sm">No transactions found</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {txsData.items.map((tx: any) => {
                  const isCredit = tx.amount > 0
                  return (
                    <div key={tx.id} className="p-3 bg-[#111] rounded-lg border border-[#222]">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase text-gray-400">{tx.type}</span>
                        <span className={`text-sm font-black ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                          {isCredit ? '+' : ''}{tx.amount.toFixed(2)} {tx.balanceType === 'POINTS' ? 'PTS' : 'RM'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{tx.description}</p>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500">
                        <span>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</span>
                        {tx.refId && <span>Ref: {tx.refId.substring(0,8)}...</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-md shadow-2xl border border-[#333] overflow-hidden">
            <div className="p-5 border-b border-[#333] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Adjust Wallet Balance</h3>
              <button onClick={() => setAdjustingUser(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#111] rounded-lg border border-[#222]">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Target Member</p>
                  <p className="font-bold text-white">{adjustingUser.user?.firstName} {adjustingUser.user?.lastName}</p>
                </div>
              </div>

              {adjustError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {adjustError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Amount (Negative to Deduct)</label>
                <input
                  type="number"
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({...adjustForm, amount: e.target.value})}
                  placeholder="e.g. 50.00 or -20.00"
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#3A5D36]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Reason / Description</label>
                <input
                  type="text"
                  value={adjustForm.description}
                  onChange={(e) => setAdjustForm({...adjustForm, description: e.target.value})}
                  placeholder="e.g. Manual top-up for event"
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#3A5D36]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#333] flex justify-end gap-3">
              <button onClick={() => setAdjustingUser(null)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => adjustMutation.mutate()}
                disabled={adjustMutation.isPending || !adjustForm.amount || !adjustForm.description}
                className="px-6 py-2 rounded-lg text-sm font-black text-white bg-[#3A5D36] hover:bg-[#C5963B] transition-colors disabled:opacity-50"
              >
                {adjustMutation.isPending ? 'Adjusting...' : 'Confirm Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
