import { apiClient } from './client'
import type { User } from '../types'

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  referralCode?: string
}
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
}
