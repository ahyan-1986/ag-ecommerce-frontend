import { apiClient } from './client'
import type { Product, ProductVariant, AdminProduct, BackendListResponse, PaginatedResponse } from '../types'

/** Transform a raw backend product → customer-facing Product shape */
function toProduct(raw: AdminProduct): Product {
  let images: string[] = []
  if (raw.imageUrl) images.push(raw.imageUrl)
  try {
    const extra = JSON.parse(raw.imageUrls || '[]')
    if (Array.isArray(extra)) images = images.concat(extra)
  } catch { /* ignore */ }

  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.name,
    slug: raw.id, // use id as slug fallback
    description: raw.description,
    images,
    imageUrl: raw.imageUrl,
    isFeatured: raw.isFeatured,
    isActive: raw.status === 'published',
    status: raw.status,
    category: raw.category,
    brand: raw.brand,
    createdAt: raw.createdAt,
    variants: (raw.variants ?? []).map(toVariant),
  }
}

function toVariant(v: import('../types').AdminProductVariant): ProductVariant {
  return {
    id: v.id,
    productId: v.productId,
    sku: v.sku,
    name: v.name,
    priceRM: v.retailPrice,
    dealerPrice: v.dealerPrice,
    bv: v.bv,
    pv: v.pv,
    weightGrams: Math.round((v.weight ?? 0) * 1000),
    stockQty: v.stockOnHand,
    isActive: v.isActive,
    imageUrl: v.imageUrl,
  }
}

/** Adapts backend { items, total, page, pageSize } into a paginated result */
function adaptList(raw: BackendListResponse<AdminProduct>): PaginatedResponse<Product> {
  return {
    items: (raw.items ?? []).map(toProduct),
    total: raw.total,
    page: raw.page,
    pageSize: raw.pageSize,
  }
}

/** Admin version — returns raw AdminProduct[] for full field access */
function adaptAdminList(raw: BackendListResponse<AdminProduct>): PaginatedResponse<AdminProduct> {
  return {
    items: raw.items ?? [],
    total: raw.total,
    page: raw.page,
    pageSize: raw.pageSize,
  }
}

export const productsApi = {
  // ── Public (customer) ──────────────────────────────────────────────────────

  list: (params?: { search?: string; page?: number; pageSize?: number; featured?: boolean }) =>
    apiClient.get<BackendListResponse<AdminProduct>>('/public/products', { params })
      .then((r) => adaptList(r.data)),

  get: (idOrSlug: string) =>
    apiClient.get<AdminProduct>(`/public/products/${idOrSlug}`)
      .then((r) => toProduct(r.data)),

  getFeatured: () =>
    apiClient.get<AdminProduct[]>('/public/products/featured')
      .then((r) => (r.data ?? []).map(toProduct)),

  // ── Admin ──────────────────────────────────────────────────────────────────

  /** Returns raw AdminProduct with full schema for admin pages */
  adminList: (params?: { search?: string; page?: number; pageSize?: number; status?: string; category?: string }) =>
    apiClient.get<BackendListResponse<AdminProduct>>('/admin/products', { params })
      .then((r) => adaptAdminList(r.data)),

  adminGet: (id: string) =>
    apiClient.get<AdminProduct>(`/admin/products/${id}`).then((r) => r.data),

  create: (data: object) =>
    apiClient.post<AdminProduct>('/admin/products', data).then((r) => r.data),

  update: (id: string, data: Partial<AdminProduct>) =>
    apiClient.put<AdminProduct>(`/admin/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/admin/products/${id}`).then((r) => r.data),

  uploadImage: (id: string, file: File, variantId?: string) => {
    const form = new FormData()
    form.append('image', file)
    const url = `/admin/products/${id}/image${variantId ? `?variantId=${variantId}` : ''}`
    return apiClient.post<{ url: string }>(url, form).then((r) => r.data)
  },

  createVariant: (productId: string, data: object) =>
    apiClient.post(`/admin/products/${productId}/variants`, data).then((r) => r.data),

  updateVariant: (productId: string, variantId: string, data: object) =>
    apiClient.put(`/admin/products/${productId}/variants/${variantId}`, data).then((r) => r.data),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete(`/admin/products/${productId}/variants/${variantId}`).then((r) => r.data),
}
