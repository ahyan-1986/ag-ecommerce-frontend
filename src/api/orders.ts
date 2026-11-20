import { apiClient } from './client'
import type { Order, CartItem, DashboardStats, PaginatedResponse } from '../types'

export interface CheckoutRequest {
  voucherCode?: string
  pointsToUse?: number
  sponsorCode?: string
  paymentMethod: 'stripe' | 'cod' | 'points'
  shippingRateId: string
  shippingName: string
  shippingPhone: string
  shippingLine1: string
  shippingLine2?: string
  shippingCity: string
  shippingState: string
  shippingPostcode: string
  shippingCountry?: string
  notes?: string
}

export const ordersApi = {
  // Cart
  getCart: () => apiClient.get<CartItem[]>('/me/cart').then((r) => r.data),
  addToCart: (variantId: string, quantity: number) =>
    apiClient.post<CartItem>('/me/cart', { variantId, quantity }).then((r) => r.data),
  updateCartItem: (itemId: string, quantity: number) =>
    apiClient.put<CartItem>(`/me/cart/${itemId}`, { quantity }).then((r) => r.data),
  removeCartItem: (itemId: string) =>
    apiClient.delete(`/me/cart/${itemId}`).then((r) => r.data),

  // Orders (customer)
  checkout: (data: CheckoutRequest) =>
    apiClient.post<{ order: Order; paymentUrl: string }>('/me/checkout', data).then((r) => r.data),
  myOrders: (page = 1) =>
    apiClient.get<PaginatedResponse<Order>>('/me/orders', { params: { page } }).then((r) => r.data),
  myOrder: (id: string) =>
    apiClient.get<Order>(`/me/orders/${id}`).then((r) => r.data),
  cancelOrder: (id: string) =>
    apiClient.post(`/me/orders/${id}/cancel`).then((r) => r.data),
  capturePayment: (orderNo: string, sessionId?: string) =>
    apiClient.post<{ order: Order; message: string; pending?: boolean }>(
      `/me/orders/capture/${orderNo}`,
      { sessionId: sessionId ?? '' },
    ).then((r) => r.data),
  myOrderByNo: (orderNo: string) =>
    apiClient.get<Order>(`/me/orders/by-no/${orderNo}`).then((r) => r.data),

  // Admin
  list: (params?: { status?: string; search?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<Order>>('/admin/orders', { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Order>(`/admin/orders/${id}`).then((r) => r.data),
  updateFulfillment: (id: string, data: { status: string; trackingNumber?: string }) =>
    apiClient.put(`/admin/orders/${id}/fulfillment`, data).then((r) => r.data),
  dashboardStats: () =>
    apiClient.get<DashboardStats>('/admin/dashboard').then((r) => r.data),
}
