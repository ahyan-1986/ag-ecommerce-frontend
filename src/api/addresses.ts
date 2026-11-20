import { apiClient } from './client'

export interface AddressBook {
  id: string
  userId: string
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postcode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressPayload {
  label?: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postcode?: string
  country?: string
  isDefault?: boolean
}

export const addressesApi = {
  list: () =>
    apiClient.get<{ data: AddressBook[] }>('/me/addresses').then((r) => r.data.data),

  create: (payload: CreateAddressPayload) =>
    apiClient.post<{ data: AddressBook }>('/me/addresses', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateAddressPayload>) =>
    apiClient.put<{ data: AddressBook }>(`/me/addresses/${id}`, payload).then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/me/addresses/${id}`).then((r) => r.data),

  setDefault: (id: string) =>
    apiClient.patch<{ data: AddressBook }>(`/me/addresses/${id}/default`, {}).then((r) => r.data.data),
}
