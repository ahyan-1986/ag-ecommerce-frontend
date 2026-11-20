import { apiClient } from './client'

export interface Banner {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  linkUrl: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export const bannerApi = {
  getPublicBanners: async (): Promise<Banner[]> => {
    const res = await apiClient.get<Banner[]>('/public/banners')
    return res.data
  },

  getAdminBanners: async (): Promise<Banner[]> => {
    const res = await apiClient.get<Banner[]>('/admin/banners')
    return res.data
  },

  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    const res = await apiClient.post<Banner>('/admin/banners', data)
    return res.data
  },

  updateBanner: async (id: string, data: Partial<Banner>): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>(`/admin/banners/${id}`, data)
    return res.data
  },

  deleteBanner: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/banners/${id}`)
    return res.data
  },

  uploadImage: async (id: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post<{ imageUrl: string }>(`/admin/banners/${id}/image`, formData)
    return res.data
  },
}
