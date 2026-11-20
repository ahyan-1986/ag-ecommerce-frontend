import { apiClient } from './client'

export const aiApi = {
  customerChat: async (message: string, sessionId: string) => {
    const hasToken = !!localStorage.getItem('accessToken')
    const endpoint = hasToken ? '/me/ai/chat' : '/public/ai/chat'
    try {
      const res = await apiClient.post<{ reply: string }>(endpoint, { message, sessionId })
      return res.data
    } catch {
      // Try alternate endpoint if first failed
      const fallbackEndpoint = hasToken ? '/public/ai/chat' : '/me/ai/chat'
      const res = await apiClient.post<{ reply: string }>(fallbackEndpoint, { message, sessionId })
      return res.data
    }
  },

  adminAnalytics: (prompt: string, dbContext?: string) =>
    apiClient.post<{ reply: string }>('/admin/ai/analytics', { prompt, dbContext: dbContext || '' }).then((r) => r.data),
}
