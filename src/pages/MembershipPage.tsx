import { Link } from 'react-router-dom'
import { Check, Sparkles, ArrowRight, Gift, Users, Crown, Banknote } from 'lucide-react'
import { PublicStoreLayout } from '../layouts/PublicStoreLayout'
import { TierBadge } from '../components/tier/TierBadge'

const TIER_COLUMNS = ['M', 'S1', 'S2', 'S3'] as const

const COMPARISON_ROWS = [
  {
    label: 'How to reach it',
    note: 'Permanent highest rank — never demoted',
    values: [
      'First purchase / registration',
      '10 spending downlines & RM 8,000 combined spend',
      '5 direct legs reaching One Star (S1)',
      '5 direct legs reaching Two Star (S2)',
    ],
  },
  {
    label: 'Self Rebate Bonus (RB L0)',
    note: 'Credited as Loyalty Points on Order BV',
    values: ['15%', '15%', '15%', '15%'],
  },
  {
    label: 'Sponsor & Upline Rebate (RB L1 & L2)',
    note: 'Earn on direct & 2nd-generation referrals',
    values: ['15% / 15%', '15% / 15%', '15% / 15%', '15% / 15%'],
  },
  {
    label: 'Leadership Rebate Bonus (LRB)',
    note: 'Differential breakaway across your entire circle',
    values: ['—', '15%', '30%', '45%'],
  },
  {
    label: 'Pay with Loyalty Points at Checkout',
    note: '1 Loyalty Point = RM 1.00 instant discount',
    values: [true, true, true, true],
  },
  {
    label: 'Redeem Rewards to Bank Account',
    note: 'Cash out Loyalty Points anytime (min. 50 pts)',
    values: [true, true, true, true],
  },
  {
    label: 'Free Entry to Ascend Wellness Events',
    note: 'Workshops, health talks & leadership summits',
    values: [false, true, true, true],
  },
]

export default function MembershipPage() {
  return (
    <PublicStoreLayout>
      <div className="space-y-12 pb-12">
        {/* Hero */}
        <div className="rounded-[2.25rem] bg-gradient-to-br from-[#FFF4F1] via-[#FFFBEB] to-[#ECFEF9] border-2 border-orange-100 p-8 sm:p-12 text-center space-y-4 shadow-soft">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-orange-200 text-xs font-extrabold text-[#FF5A36]">
            <Sparkles className="w-4 h-4 text-[#FFB800]" />
            ASCEND CIRCLE MEMBERSHIP
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
            The More You Grow, The More You Earn
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Every tier earns instant Loyalty Points on your orders and referrals. Unlock Leadership Bonuses up to 45% as you build your vibrant Ascend Circle.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary !px-8">
              Join Ascend Circle Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/shop" className="btn-secondary !px-7">
              Browse Products
            </Link>
          </div>
        </div>

        {/* Comparison Table (Exact Aameba origin/dev /membership structure) */}
        <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#FFF7F2] via-[#FFFDF5] to-[#F2FEFA] border-b-2 border-orange-100">
                  <th className="p-5 text-xs font-extrabold uppercase tracking-wider text-slate-500 w-[30%]">
                    Benefits
                  </th>
                  {TIER_COLUMNS.map((code) => (
                    <th key={code} className="p-5 text-center">
                      <TierBadge rank={code} size="md" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="hover:bg-orange-50/30 transition">
                    <td className="p-5">
                      <p className="font-extrabold text-slate-900 text-sm">{row.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{row.note}</p>
                    </td>
                    {row.values.map((val, i) => (
                      <td key={i} className="p-5 text-center">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-[#00A37B]">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick 4-Card Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Gift, title: 'Guest Orders Held Safely', desc: 'Even if a friend checks out as a guest, their 15% self-rebate is safely held and released the moment they register!', color: 'from-[#FF5A36] to-[#FF8A00]' },
            { icon: Users, title: 'Active Upline Compression', desc: 'Inactive accounts are seamlessly compressed so active builders never lose their upline rebates.', color: 'from-[#00C896] to-[#06B6D4]' },
            { icon: Crown, title: 'Differential Leadership', desc: 'S1 (15%), S2 (30%), and S3 (45%) earn clean differential bonuses across unlimited depth.', color: 'from-[#FFB800] to-[#F59E0B]' },
            { icon: Banknote, title: 'Flexible Redemption', desc: 'Spend Loyalty Points directly at checkout (1 pt = RM 1) or request a direct bank transfer anytime.', color: 'from-[#EC4899] to-[#8B5CF6]' },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-soft space-y-3">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}>
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{c.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicStoreLayout>
  )
}
