import { apiClient } from './client'
import type { WhatsAppBlast, PaginatedResponse } from '../types'

export const whatsappApi = {
  // Admin
  getConfig: () => apiClient.get('/admin/whatsapp/config').then((r) => r.data),
  saveConfig: (data: object) => apiClient.put('/admin/whatsapp/config', data).then((r) => r.data),
  listTemplates: () => apiClient.get('/admin/whatsapp/templates').then((r) => r.data),
  createTemplate: (data: object) => apiClient.post('/admin/whatsapp/templates', data).then((r) => r.data),
  deleteTemplate: (id: string) => apiClient.delete(`/admin/whatsapp/templates/${id}`).then((r) => r.data),
  listBlasts: (params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<WhatsAppBlast>>('/admin/whatsapp/blasts', { params }).then((r) => r.data),
  createBlast: (data: object) =>
    apiClient.post<WhatsAppBlast>('/admin/whatsapp/blasts', data).then((r) => r.data),
  sendBlast: (id: string) =>
    apiClient.post(`/admin/whatsapp/blasts/${id}/send`).then((r) => r.data),
}
