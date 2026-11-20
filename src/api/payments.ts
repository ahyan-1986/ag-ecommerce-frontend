import { apiClient } from './client'
import type { PaymentLog, PaymentLogDetail, PaginatedResponse } from '../types'

export const paymentsApi = {
  list: (params?: { gateway?: string; status?: string; eventType?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<PaymentLog>>('/admin/payment-logs', { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<PaymentLogDetail>(`/admin/payment-logs/${id}`).then((r) => r.data),
}
