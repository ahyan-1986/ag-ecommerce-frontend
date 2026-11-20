export type UserRole = 'super_admin' | 'admin' | 'dealer' | 'customer'
export type MemberRank = 'M' | 'S1' | 'S2' | 'S3'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  referralCode?: string
  memberCode?: string
  memberRank?: MemberRank
  highestRank?: MemberRank
  referredByCode?: string
  bankName?: string
  bankAccountNo?: string
  payeeName?: string
  payeeIdNo?: string
  avatarUrl?: string
  dateOfBirth?: string
  gender?: string
  companyName?: string
  dealerApproved?: boolean
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  createdAt: string
  updatedAt?: string
}

// ── Customer-facing Product types (simplified, field-compatible) ─────────────

export interface Product {
  id: string
  sku?: string
  name: string
  slug?: string
  description: string
  /** Main + gallery images (computed by API adapter) */
  images: string[]
  imageUrl?: string
  isFeatured: boolean
  isActive: boolean
  status?: 'draft' | 'published' | 'archived'
  category?: string
  brand?: string
  createdAt: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  /** Retail price in RM (maps to backend retailPrice) */
  priceRM: number
  /** Dealer price in RM */
  dealerPrice?: number
  bv?: number
  pv?: number
  /** Weight in grams (maps to backend weight * 1000) */
  weightGrams: number
  /** Available stock (maps to backend stockOnHand) */
  stockQty: number
  isActive: boolean
  imageUrl?: string
}

// ── Admin-facing Product types (full backend schema) ─────────────────────────

export type ProductStatus = 'draft' | 'published' | 'archived'

export interface AdminProduct {
  id: string
  sku: string
  name: string
  nameZh: string
  description: string
  category: string
  brand: string
  /** Primary image URL */
  imageUrl: string
  /** JSON-encoded string array of additional images */
  imageUrls: string
  /** JSON-encoded string array of tags */
  tags: string
  status: ProductStatus
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  variants: AdminProductVariant[]
}

export interface AdminProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  /** JSON-encoded object e.g. {"weight":"5kg","scent":"lavender"} */
  attributes: string
  imageUrl: string
  retailPrice: number
  dealerPrice: number
  bv: number
  pv: number
  stockOnHand: number
  stockReserved: number
  lowStockAlert: number
  /** Weight in kg */
  weight: number
  isActive: boolean
  sortOrder: number
}

/** Backend paginated list response */
export interface BackendListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Raw backend cart variant shape (no frontend transform) */
export interface RawCartVariant {
  id: string
  name: string
  sku: string
  retailPrice: number
  dealerPrice: number
  imageUrl?: string
  stockOnHand: number
  stockReserved: number
  weight?: number
  product?: {
    id: string
    name: string
    imageUrl?: string
  }
}

export interface CartItem {
  id: string
  variantId: string
  quantity: number
  variant?: RawCartVariant
}

export interface OrderAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postcode: string
  country: string
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type ShippingStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  orderNo: string
  status: OrderStatus
  totalAmount: number
  shippingFee: number
  discountAmount: number
  items: OrderItem[]
  shippingName: string
  shippingPhone: string
  shippingLine1: string
  shippingLine2?: string
  shippingCity: string
  shippingState: string
  shippingPostcode: string
  shippingCountry: string
  trackingNumber?: string
  courier?: string
  shippingStatus?: ShippingStatus
  paymentMethod: string
  user?: { id: string; email: string; referralCode?: string }
  paymentRef?: string
  paidAt?: string
  voucherCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  variantId: string
  productName: string
  variantName: string
  sku: string
  imageUrl?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Voucher {
  id: string
  code: string
  name: string
  description?: string
  type: 'PERCENT' | 'CASH'
  value: number
  minSpend: number
  maxDiscount: number
  maxQty: number
  usedQty: number
  perUserLimit: number
  active: boolean
  startsAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface VoucherRedemption {
  id: string
  voucherId: string
  userId: string
  orderId: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  redeemedAt: string
  voucher?: Voucher
}

/** Inventory movement — matches backend schema exactly */
export interface InventoryMovement {
  id: string
  variantId: string
  /** receive | sale | adjust | return | write_off */
  type: string
  /** Positive = stock in, negative = stock out */
  quantity: number
  balanceBefore: number
  balanceAfter: number
  reference?: string
  note?: string
  createdAt: string
  variant?: AdminProductVariant & { product: AdminProduct }
}

// ── Shipping types ──────────────────────────────────────────────────────────

export type ShippingRateType =
  | 'flat'         // fixed fee
  | 'free'         // free (with optional min order threshold)
  | 'by_weight'    // tiered by weight (kg)
  | 'flat_plus_kg' // base fee + per-kg surcharge above threshold
  | 'by_dimension' // volumetric weight pricing
  | 'by_price'     // tiered by order subtotal
  | 'by_item'      // per-item fee
  | 'cod'          // cash on delivery with handling fee

export interface WeightTier {
  minKg: number
  maxKg: number  // 0 = unlimited
  rateRM: number
}

export interface PriceTier {
  minRM: number
  maxRM: number  // 0 = unlimited
  rateRM: number
}

export interface ShippingZone {
  id: string
  name: string
  description: string
  /** JSON-encoded string[] of ISO country codes */
  countries: string
  /** JSON-encoded string[] of state/province names */
  states: string
  isActive: boolean
  sortOrder: number
  rates?: ShippingRate[]
}

export interface ShippingRate {
  id: string
  zoneId: string
  name: string
  carrier: string
  rateType: ShippingRateType

  // Flat / base
  flatRateRM: number

  // Weight-based
  /** JSON-encoded WeightTier[] */
  weightTiers: string
  perKgRM: number
  freeKgLimit: number

  // Volumetric
  volumetricDivisor: number

  // Price-tiered
  /** JSON-encoded PriceTier[] */
  priceTiers: string

  // Per-item
  perItemRM: number
  maxItemFee: number

  // COD
  codFeeRM: number
  codFeePercent: number
  codMaxFeeRM: number

  // Conditions
  minOrderRM: number
  maxOrderRM: number

  // Delivery estimate
  estDaysMin: number
  estDaysMax: number
  cutoffTime: string

  isActive: boolean
  sortOrder: number
  zone?: ShippingZone
}

export interface CalculatedRate {
  rateId: string
  zoneName: string
  name: string
  carrier: string
  rateType: string
  costRM: number
  estDaysMin: number
  estDaysMax: number
  cutoffTime: string
}

export interface AffiliateCommission {
  id: string
  referrerId: string
  refereeId?: string
  orderId: string
  orderNo: string
  bonusType?: 'RB' | 'LRB' | string
  giverName?: string
  earnerRank?: MemberRank
  saleAmount: number
  orderBv?: number
  commissionRate: number
  commissionAmt: number
  currency: string
  status: 'pending' | 'approved' | 'paid'
  level: number
  remark?: string
  paidAt?: string
  createdAt: string
  referrer?: { firstName: string; lastName: string; email: string }
  referee?: { firstName: string; lastName: string; email: string }
}

export interface AffiliateStats {
  totalEarned: number
  pendingEarned: number
  totalReferrals: number
  myReferralCode: string
}

export interface MLMNetworkStats {
  totalDownline: number
  directReferrals: number
  totalEarned: number
  pendingEarned: number
  earnedByLevel: Record<number, number>
  downlineByLevel: Record<number, number>
  myReferralCode: string
  referralLink: string
  levelRates: number[]
  leadershipRates?: Record<string, number>
  totalConversions?: number
}

export interface MLMTreeNode {
  userId: string
  memberCode?: string
  firstName: string
  lastName: string
  email: string
  referralCode: string
  memberRank?: MemberRank
  level: number
  joinedAt: string
  children: MLMTreeNode[]
  totalOrders: number
  totalSpend?: number
  totalEarned: number
}

export interface SponsorInfo {
  hasSponsor: boolean
  sponsorId?: string
  firstName?: string
  lastName?: string
  email?: string
  referralCode?: string
  joinedAt?: string
}

export interface AffiliateSettings {
  id: string
  commissionRate: number
  mlmLevelRates: string
  mlmDepth: number
  minPayoutAmt: number
  isActive: boolean
}

export interface WhatsAppBlast {
  id: string
  templateName: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  recipientCount: number
  sentCount: number
  failedCount: number
  createdAt: string
  scheduledAt?: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalDealers: number
  pendingOrders: number
  lowStockProducts: number
  monthlyRevenue: { month: string; revenue: number }[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages?: number
}

// ── Payment Gateway Logs ──────────────────────────────────────────────────────

export type PaymentLogStatus = 'received' | 'processed' | 'failed' | 'ignored'

export interface PaymentLog {
  id: string
  gateway: string
  eventType: string
  gatewayTxnId: string
  orderId?: string
  orderNo: string
  /** Amount in smallest currency unit (cents for MYR) */
  amountCents: number
  currency: string
  status: PaymentLogStatus
  errorMessage: string
  ipAddress: string
  createdAt: string
}

export interface PaymentLogDetail extends PaymentLog {
  rawPayload: string
}

// ── E-Wallet ────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string
  userId: string
  rmBalance: number
  pointsBalance: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

export interface WalletTransaction {
  id: string
  walletId: string
  userId: string
  amount: number
  balanceType: 'RM' | 'POINTS'
  type: string
  refId: string
  orderNo?: string
  description: string
  createdAt: string
}

// ── Aameba Dev Flow Types (Rank Ladder, My Vouchers, Redeem Rewards) ────────

export interface RankRung {
  code: MemberRank
  label: string
  earned: boolean
  current: boolean
}

export interface RankRequirement {
  metric: 'SPENDING_DOWNLINES' | 'COMBINED_SPEND' | 'ONE_STAR_LEGS' | 'TWO_STAR_LEGS' | string
  label: string
  kind: 'count' | 'money'
  current: number
  target: number
  percent: number
}

export interface RankProgressResponse {
  currentRank: MemberRank
  currentRankLabel: string
  nextRank?: MemberRank
  nextRankLabel?: string
  rungs: RankRung[]
  requirements: RankRequirement[]
  pendingSettlement: boolean
}

export interface MemberDashboardResponse {
  memberCode: string
  referralCode: string
  memberRank: MemberRank
  memberRankLabel: string
  totalReferrals: number
  totalDownline: number
  availablePoints: number
  lifetimePoints: number
  rankProgress: RankProgressResponse
}

export interface UserVoucher {
  id: string
  voucherId: string
  userId: string
  claimedAt: string
  expiresAt?: string
  usedAt?: string
  orderId?: string
  voucher?: Voucher
}

export interface MyVouchersResponse {
  held: UserVoucher[]
  claimable: Voucher[]
}

export interface WithdrawalInfoResponse {
  eligible: boolean
  ineligibleReason?: string
  availablePoints: number
  minAmount: number
  feeRate: number
  bankName: string
  bankAccountNo: string
  payeeName: string
  payeeIdNo: string
}

export interface WithdrawalQuoteResponse {
  amount: number
  feeRate: number
  feeAmount: number
  netAmount: number
  currency: string
}

export interface WithdrawalRequest {
  id: string
  receiptNo: string
  userId: string
  amount: number
  feeAmount: number
  netAmount: number
  currency: string
  bankName: string
  bankAccountNo: string
  payeeName: string
  payeeIdNo: string
  status: 'pending' | 'approved' | 'rejected'
  adminRemark?: string
  reviewedAt?: string
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    memberCode?: string
  }
}
