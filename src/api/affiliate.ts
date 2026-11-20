import { apiClient } from './client'
import type {
  AffiliateStats,
  AffiliateCommission,
  AffiliateSettings,
  MLMNetworkStats,
  MLMTreeNode,
  SponsorInfo,
  MemberDashboardResponse,
  PaginatedResponse,
} from '../types'

export const affiliateApi = {
  // ── Public ─────────────────────────────────────────────────────────────────
  verifyReferralCode: (code: string) =>
    apiClient
      .get<{ valid: boolean; referralCode: string; memberCode: string; sponsorName: string; memberRank: string }>(
        `/public/referral/${encodeURIComponent(code)}`
      )
      .then((r) => r.data),

  // ── Customer / Member ──────────────────────────────────────────────────────
  myDashboard: () =>
    apiClient.get<MemberDashboardResponse>('/me/dashboard').then((r) => r.data),

  myStats: () =>
    apiClient.get<AffiliateStats>('/me/affiliate/stats').then((r) => r.data),

  myNetworkStats: () =>
    apiClient.get<MLMNetworkStats>('/me/affiliate/network-stats').then((r) => r.data),

  mySponsor: () =>
    apiClient.get<SponsorInfo>('/me/affiliate/sponsor').then((r) => r.data),

  myNetworkTree: () =>
    apiClient.get<MLMTreeNode>('/me/affiliate/network-tree').then((r) => r.data),

  myCommissions: (params?: { page?: number; pageSize?: number }) =>
    apiClient
      .get<PaginatedResponse<AffiliateCommission>>('/me/affiliate/commissions', { params })
      .then((r) => r.data),

  // ── Admin ──────────────────────────────────────────────────────────────────
  listCommissions: (params?: { status?: string; page?: number }) =>
    apiClient
      .get<PaginatedResponse<AffiliateCommission>>('/admin/affiliate/commissions', { params })
      .then((r) => r.data),

  getSettings: () =>
    apiClient.get<AffiliateSettings>('/admin/affiliate/settings').then((r) => r.data),

  updateSettings: (data: {
    commissionRate?: number
    mlmLevelRates?: number[]
    leadershipRates?: Record<string, number>
    mlmDepth?: number
    oneStarMinDownlines?: number
    oneStarMinSpend?: number
    twoStarMinS1Legs?: number
    threeStarMinS2Legs?: number
    minPayoutAmt?: number
    withdrawalFeeRate?: number
    isActive?: boolean
  }) => apiClient.put<AffiliateSettings>('/admin/affiliate/settings', data).then((r) => r.data),

  approveCommission: (id: string) =>
    apiClient.post(`/admin/affiliate/commissions/${id}/approve`).then((r) => r.data),

  markPaid: (id: string) =>
    apiClient.post(`/admin/affiliate/commissions/${id}/pay`).then((r) => r.data),

  adminNetworkTree: (userId: string) =>
    apiClient.get<MLMTreeNode>(`/admin/affiliate/network/${userId}`).then((r) => r.data),
}
