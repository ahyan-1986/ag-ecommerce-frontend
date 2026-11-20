import { apiClient } from './client'
import type { Voucher, VoucherRedemption, MyVouchersResponse, UserVoucher, PaginatedResponse } from '../types'

export interface CreateVoucherPayload {
  code: string
  name: string
  description?: string
  type: 'PERCENT' | 'CASH'
  value: number
  minSpend?: number
  maxDiscount?: number
  maxQty?: number
  perUserLimit?: number
  isClaimable?: boolean
  firstPurchaseOnly?: boolean
  validDaysFromClaim?: number
  active: boolean
  startsAt?: string
  expiresAt?: string
}

export interface UpdateVoucherPayload {
  name?: string
  description?: string
  minSpend?: number
  maxDiscount?: number
  maxQty?: number
  perUserLimit?: number
  isClaimable?: boolean
  firstPurchaseOnly?: boolean
  validDaysFromClaim?: number
  active?: boolean
  startsAt?: string | null
  expiresAt?: string | null
}

export const vouchersApi = {
  // Customer / Member (Aameba My Vouchers)
  myVouchers: () =>
    apiClient.get<MyVouchersResponse>('/me/vouchers').then((r) => r.data),

  claim: (code: string) =>
    apiClient.post<UserVoucher>(`/me/vouchers/${encodeURIComponent(code)}/claim`).then((r) => r.data),

  validate: (code: string, cartTotal: number) =>
    apiClient.post<{ voucher: Voucher; discountAmount: number; finalTotal: number }>(
      '/me/vouchers/validate', { code, cartTotal }
    ).then((r) => r.data),

  // Admin
  list: (params?: { active?: boolean; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<Voucher>>('/admin/vouchers', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Voucher>(`/admin/vouchers/${id}`).then((r) => r.data),

  create: (data: CreateVoucherPayload) =>
    apiClient.post<Voucher>('/admin/vouchers', data).then((r) => r.data),

  update: (id: string, data: UpdateVoucherPayload) =>
    apiClient.put<Voucher>(`/admin/vouchers/${id}`, data).then((r) => r.data),

  toggleActive: (id: string, active: boolean) =>
    apiClient.put<Voucher>(`/admin/vouchers/${id}`, { active }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/admin/vouchers/${id}`).then((r) => r.data),

  redemptions: (params?: { voucherId?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<VoucherRedemption>>('/admin/vouchers/redemptions', { params })
      .then((r) => r.data),
}
