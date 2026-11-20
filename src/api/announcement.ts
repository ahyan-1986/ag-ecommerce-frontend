import { apiClient } from './client'

export interface Announcement {
  id: string
  title: string
  content: string
  isActive: boolean
  priority: number
  attachmentUrl?: string
  attachmentName?: string
  createdAt: string
  updatedAt: string
}

export const announcementApi = {
  getActive: async (): Promise<Announcement[]> => {
    const res = await apiClient.get<Announcement[]>('/me/announcements')
    return res.data
  },

  getAdmin: async (): Promise<Announcement[]> => {
    const res = await apiClient.get<Announcement[]>('/admin/announcements')
    return res.data
  },

  create: async (data: Partial<Announcement>): Promise<Announcement> => {
    const res = await apiClient.post<Announcement>('/admin/announcements', data)
    return res.data
  },

  update: async (id: string, data: Partial<Announcement>): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>(`/admin/announcements/${id}`, data)
    return res.data
  },

  deleteAnnouncement: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/announcements/${id}`)
    return res.data
  },

  uploadAttachment: async (id: string, file: File): Promise<{ attachmentUrl: string }> => {
    const formData = new FormData()
    formData.append('attachment', file)
    const res = await apiClient.post<{ attachmentUrl: string }>(`/admin/announcements/${id}/attachment`, formData)
    return res.data
  },
}
