import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Banknote,
  AlertCircle,
  CheckCircle2,
  Building2,
  Receipt,
  X,
  Lock,
  Sparkles,
} from 'lucide-react'
import { walletApi } from '../../api/wallet'
import type { WithdrawalQuoteResponse, WithdrawalRequest } from '../../types'

export default function WithdrawalsPage() {
  const qc = useQueryClient()
  const [amountText, setAmountText] = useState('')
  const [password, setPassword] = useState('')
  const [quote, setQuote] = useState<WithdrawalQuoteResponse | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [receiptModal, setReceiptModal] = useState<WithdrawalRequest | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: info, isLoading } = useQuery({
    queryKey: ['withdrawal-info'],
    queryFn: walletApi.getWithdrawalInfo,
  })

  const { data: listData } = useQuery({
    queryKey: ['my-withdrawals', statusFilter],
    queryFn: () => walletApi.listMyWithdrawals({ status: statusFilter }),
  })

  // Debounced live fee quote (matching Aameba WithdrawalRequestForm)
  const parsedAmount = parseFloat(amountText)
  useEffect(() => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setQuote(null)
      return
    }
    const t = setTimeout(() => {
      walletApi.quoteWithdrawal(parsedAmount).then(setQuote).catch(() => setQuote(null))
    }, 300)
    return () => clearTimeout(t)
  }, [parsedAmount])

  const submitMut = useMutation({
    mutationFn: () => walletApi.createWithdrawal({ amount: parsedAmount, password }),
    onSuccess: (created) => {
      setFeedback({ type: 'ok', text: `Redemption ${created.receiptNo} submitted successfully!` })
      setAmountText('')
      setPassword('')
      setQuote(null)
      setReceiptModal(created)
      qc.invalidateQueries({ queryKey: ['withdrawal-info'] })
      qc.invalidateQueries({ queryKey: ['my-withdrawals'] })
      qc.invalidateQueries({ queryKey: ['member-dashboard'] })
    },
    onError: (err: any) => {
      setFeedback({ type: 'err', text: err?.response?.data?.error || 'Redemption request failed' })
    },
  })

  const withdrawals = listData?.items ?? []

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A36]">Loyalty &amp; Rewards</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Redeem Rewards</h1>
        <p className="text-sm text-slate-500 mt-1">
          Convert your earned Loyalty Points directly into cash transferred to your registered bank account.
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl px-5 py-3.5 text-sm font-bold flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.text}
        </div>
      )}

      {/* ── Request Card (Exact Aameba origin/dev WithdrawalRequestForm) ─── */}
      <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-8 shadow-soft">
        {isLoading ? (
          <p className="text-sm text-slate-400">Checking eligibility...</p>
        ) : !info?.eligible ? (
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Bank Details Required</h2>
                <p className="text-xs text-slate-600 mt-1">
                  {info?.ineligibleReason || 'Please complete your Bank Account & Payee Details in My Profile first.'}
                </p>
              </div>
            </div>
            <Link to="/profile" className="btn-primary !px-5 !py-2.5 !text-xs shrink-0">
              Update Bank Details
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Payee Bank Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#FFF4F1] via-[#FFFBEB] to-[#ECFEF9] border border-orange-200/80 p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Available Loyalty Points
                </p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {info.availablePoints.toFixed(2)} <span className="text-sm font-bold text-slate-400">pts</span>
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  Min. redemption: {info.minAmount.toFixed(2)} pts • Processing fee: {info.feeRate}%
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-3">
                <p className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#00A37B]" /> Registered Payout Account
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Bank</p>
                    <p className="font-bold text-slate-800 mt-0.5">{info.bankName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Account No.</p>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{info.bankAccountNo}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Payee Name</p>
                    <p className="font-bold text-slate-800 mt-0.5">{info.payeeName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form & Live Quote */}
            <form
              className="lg:col-span-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setFeedback(null)
                submitMut.mutate()
              }}
            >
              <div>
                <label className="label">Points to Redeem (1 pt = RM 1.00)</label>
                <input
                  type="number"
                  step="0.01"
                  min={info.minAmount}
                  max={info.availablePoints}
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                  placeholder={`Enter amount (min ${info.minAmount})`}
                  className="input"
                  required
                />
              </div>

              {quote && (
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2 text-xs">
                  <p className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Live Payout Quote
                  </p>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Redemption Amount</span>
                    <span>RM {quote.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Processing Fee ({quote.feeRate}%)</span>
                    <span>RM {quote.feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-1.5 border-t border-emerald-200">
                    <span>Net Bank Payout</span>
                    <span className="text-[#00A37B]">RM {quote.netAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="label flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#FF5A36]" /> Confirm Account Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your login password to authorize"
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitMut.isPending || !parsedAmount || parsedAmount < info.minAmount}
                className="btn-primary w-full"
              >
                <Banknote className="w-4 h-4" />
                {submitMut.isPending ? 'Submitting Request...' : 'Submit Redemption Request'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Redemption History Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-7 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-900">Redemption History</h2>
          <div className="flex gap-1.5">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold capitalize transition ${
                  statusFilter === st
                    ? 'bg-[#FF5A36] text-white'
                    : 'bg-orange-50 text-slate-600 hover:bg-orange-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No redemption requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-orange-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Receipt No.</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Bank Account</th>
                  <th className="py-3 pr-4 text-right">Net Payout</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-orange-50/30">
                    <td className="py-3.5 pr-4 font-mono text-xs font-extrabold text-slate-800">{w.receiptNo}</td>
                    <td className="py-3.5 pr-4 text-xs text-slate-500">
                      {new Date(w.createdAt).toLocaleDateString('en-MY')}
                    </td>
                    <td className="py-3.5 pr-4 text-xs font-semibold text-slate-700">
                      {w.bankName} • {w.bankAccountNo}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-black text-slate-900">RM {w.netAmount.toFixed(2)}</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          w.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : w.status === 'rejected'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setReceiptModal(w)}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-[#FF5A36] hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Withdrawal Receipt Modal ─────────────────────────────────────── */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-orange-100 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5A36]">
                  Ascend Group Redemption Receipt
                </p>
                <h3 className="text-lg font-extrabold text-slate-900 font-mono">{receiptModal.receiptNo}</h3>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="p-2 rounded-full hover:bg-orange-50 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Payee Name</span>
                <span className="font-extrabold text-slate-800">{receiptModal.payeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank</span>
                <span className="font-extrabold text-slate-800">{receiptModal.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number</span>
                <span className="font-mono font-extrabold text-slate-800">{receiptModal.bankAccountNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Points</span>
                <span className="font-bold text-slate-800">{receiptModal.amount.toFixed(2)} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee</span>
                <span className="font-bold text-slate-800">RM {receiptModal.feeAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-orange-100">
                <span>Net Payout</span>
                <span className="text-[#00A37B]">RM {receiptModal.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Status</span>
                <span className="uppercase font-extrabold text-[#FF5A36]">{receiptModal.status}</span>
              </div>
              {receiptModal.adminRemark && (
                <div className="p-3 rounded-xl bg-slate-50 text-slate-600 font-medium">
                  Note: {receiptModal.adminRemark}
                </div>
              )}
            </div>
            <button onClick={() => setReceiptModal(null)} className="btn-primary w-full !py-2.5">
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
