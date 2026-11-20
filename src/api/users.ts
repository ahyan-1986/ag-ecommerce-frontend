import { apiClient } from './client'
import type { User, PaginatedResponse } from '../types'

export interface CRMUserStats {
  userId: string
  totalOrders: number
  totalSpend: number
  lastOrderAt: string
  downlineCount: number
  commissionEarned: number
}

export interface CRMSummary {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  totalRevenue: number
  avgOrderValue: number
  withReferralCode: number
}

export const usersApi = {
  me: () => apiClient.get<User>('/me/profile').then((r) => r.data),
  updateProfile: (data: Partial<User>) => apiClient.put<User>('/me/profile', data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/me/password', data).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return apiClient.post<User>('/me/profile/avatar', form).then((r) => r.data)
  },

  // Admin
  list: (params?: { role?: string; search?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<User>> =>
    apiClient.get<{ items: User[]; total: number; page: number; pageSize: number }>('/admin/users', { params }).then((r) => ({
      items: r.data.items,
      total: r.data.total,
      page: r.data.page,
      pageSize: r.data.pageSize,
    })),

  get: (id: string) => apiClient.get<User>(`/admin/users/${id}`).then((r) => r.data),

  getCRMSummary: () => apiClient.get<CRMSummary>('/admin/users/crm-summary').then((r) => r.data),

  getUserCRMStats: (id: string) => apiClient.get<CRMUserStats>(`/admin/users/${id}/crm-stats`).then((r) => r.data),

  setActive: (id: string, isActive: boolean) =>
    apiClient.put(`/admin/users/${id}/active`, { active: isActive }).then((r) => r.data),

  approveDealer: (id: string) =>
    apiClient.post(`/admin/users/${id}/approve-dealer`).then((r) => r.data),
}
