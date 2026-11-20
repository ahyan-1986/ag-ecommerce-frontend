import { Sparkles, Star, Award, Crown } from 'lucide-react'
import type { MemberRank } from '../../types'

const TIER_CONFIG: Record<
  MemberRank,
  {
    label: string
    classes: string
    icon: typeof Sparkles
  }
> = {
  M: {
    label: 'Member',
    classes: 'bg-gradient-to-r from-cyan-50 to-emerald-50 text-teal-700 border border-teal-200',
    icon: Sparkles,
  },
  S1: {
    label: 'One Star',
    classes: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300',
    icon: Star,
  },
  S2: {
    label: 'Two Star',
    classes: 'bg-gradient-to-r from-orange-100 via-rose-100 to-pink-100 text-rose-700 border border-rose-300',
    icon: Award,
  },
  S3: {
    label: 'Three Star',
    classes: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 text-white shadow-sm border border-white/30',
    icon: Crown,
  },
}

export function TierBadge({
  rank,
  size = 'sm',
}: {
  rank?: MemberRank | string | null
  size?: 'xs' | 'sm' | 'md'
}) {
  const code = (rank && rank in TIER_CONFIG ? rank : 'M') as MemberRank
  const cfg = TIER_CONFIG[code]
  const Icon = cfg.icon
  const pad =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'md'
      ? 'px-3.5 py-1.5 text-xs'
      : 'px-2.5 py-1 text-[11px]'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-extrabold tracking-wide ${pad} ${cfg.classes}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {cfg.label}
    </span>
  )
}
