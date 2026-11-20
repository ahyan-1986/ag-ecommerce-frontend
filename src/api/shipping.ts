import { apiClient } from './client'
import type { ShippingZone, ShippingRate, ShippingRateType, CalculatedRate, WeightTier, PriceTier } from '../types'

export interface CreateRatePayload {
  zoneId: string
  name: string
  carrier?: string
  rateType: ShippingRateType
  isActive: boolean
  sortOrder: number
  // flat / base
  flatRateRM?: number
  // weight-based
  weightTiers?: WeightTier[]
  perKgRM?: number
  freeKgLimit?: number
  // volumetric
  volumetricDivisor?: number
  // price-tiered
  priceTiers?: PriceTier[]
  // per-item
  perItemRM?: number
  maxItemFee?: number
  // cod
  codFeeRM?: number
  codFeePercent?: number
  codMaxFeeRM?: number
  // conditions
  minOrderRM?: number
  maxOrderRM?: number
  // delivery estimate
  estDaysMin?: number
  estDaysMax?: number
  cutoffTime?: string
}

export const shippingApi = {
  // ── Zones ────────────────────────────────────────────────────────────────

  listZones: () =>
    apiClient.get<ShippingZone[]>('/admin/shipping/zones').then((r) => r.data ?? []),

  createZone: (data: {
    name: string; description?: string
    countries: string[]; states: string[]
    isActive: boolean; sortOrder: number
  }) => apiClient.post<ShippingZone>('/admin/shipping/zones', data).then((r) => r.data),

  updateZone: (id: string, data: Partial<{
    name: string; description: string
    countries: string[]; states: string[]
    isActive: boolean; sortOrder: number
  }>) => apiClient.put<ShippingZone>(`/admin/shipping/zones/${id}`, data).then((r) => r.data),

  deleteZone: (id: string) =>
    apiClient.delete(`/admin/shipping/zones/${id}`).then((r) => r.data),

  // ── Rates ────────────────────────────────────────────────────────────────

  listRates: (zoneId?: string) =>
    apiClient.get<ShippingRate[]>('/admin/shipping/rates', {
      params: zoneId ? { zoneId } : undefined,
    }).then((r) => r.data ?? []),

  createRate: (data: CreateRatePayload) =>
    apiClient.post<ShippingRate>('/admin/shipping/rates', data).then((r) => r.data),

  updateRate: (id: string, data: Partial<CreateRatePayload>) =>
    apiClient.put<ShippingRate>(`/admin/shipping/rates/${id}`, data).then((r) => r.data),

  deleteRate: (id: string) =>
    apiClient.delete(`/admin/shipping/rates/${id}`).then((r) => r.data),

  // ── Public calculator ────────────────────────────────────────────────────

  calculate: (data: {
    country: string; state?: string
    weightKg: number; orderRM: number
    itemCount?: number
    lengthCm?: number; widthCm?: number; heightCm?: number
  }) =>
    apiClient.post<CalculatedRate[]>('/public/shipping/calculate', data).then((r) => r.data ?? []),
}
