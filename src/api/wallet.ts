import { apiClient } from './client'
import type {
  Wallet,
  WalletTransaction,
  WithdrawalInfoResponse,
  WithdrawalQuoteResponse,
  WithdrawalRequest,
  PaginatedResponse,
} from '../types'

export const walletApi = {
  getMyWallet: () =>
    apiClient.get<Wallet>('/me/wallet').then((r) => r.data),

  getMyTransactions: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<WalletTransaction>>('/me/wallet/transactions', { params })
      .then((r) => r.data),

  // Redeem Rewards / Withdrawals (Aameba origin/dev flow)
  getWithdrawalInfo: () =>
    apiClient.get<WithdrawalInfoResponse>('/me/withdrawals/info').then((r) => r.data),

  quoteWithdrawal: (amount: number) =>
    apiClient.post<WithdrawalQuoteResponse>('/me/withdrawals/quote', { amount }).then((r) => r.data),

  createWithdrawal: (data: { amount: number; password: string }) =>
    apiClient.post<WithdrawalRequest>('/me/withdrawals', data).then((r) => r.data),

  listMyWithdrawals: (params?: { status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<WithdrawalRequest>>('/me/withdrawals', { params }).then((r) => r.data),

  getMyWithdrawal: (id: string) =>
    apiClient.get<WithdrawalRequest>(`/me/withdrawals/${id}`).then((r) => r.data),

  // Admin
  listWallets: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Wallet>>('/admin/wallets', { params }).then((r) => r.data),

  adminListTransactions: (params?: { walletId?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<WalletTransaction>>('/admin/wallets/transactions', { params }).then((r) => r.data),

  adminAdjustBalance: (userId: string, data: { amount: number; balanceType: 'RM' | 'POINTS'; description: string }) =>
    apiClient.post(`/admin/wallets/${userId}/adjust`, data).then((r) => r.data),

  adminListWithdrawals: (params?: { status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<WithdrawalRequest>>('/admin/withdrawals', { params }).then((r) => r.data),

  adminApproveWithdrawal: (id: string, remark?: string) =>
    apiClient.post<WithdrawalRequest>(`/admin/withdrawals/${id}/approve`, { remark: remark ?? '' }).then((r) => r.data),

  adminRejectWithdrawal: (id: string, remark?: string) =>
    apiClient.post<WithdrawalRequest>(`/admin/withdrawals/${id}/reject`, { remark: remark ?? '' }).then((r) => r.data),
}
