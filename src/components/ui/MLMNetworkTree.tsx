import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, User, Users, Crown, Star, Award, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react'
import type { MLMTreeNode } from '../../types'

const LEVEL_CONFIG = [
  // level 0 = self (root)
  { color: '#D4AF37', bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.4)',   label: 'You',   icon: Crown },
  // level 1 = direct referrals (L1)
  { color: '#D4AF37', bg: 'rgba(233,30,140,0.07)', border: 'rgba(233,30,140,0.22)', label: 'L1',    icon: Star },
  // level 2
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)',  label: 'L2',    icon: Award },
  // level 3
  { color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.18)', label: 'L3', icon: User },
  // level 4+
  { color: '#6B7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.15)', label: 'L4+', icon: User },
]

function getLevelCfg(level: number) {
  return LEVEL_CONFIG[Math.min(level, LEVEL_CONFIG.length - 1)]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

function countDescendants(node: MLMTreeNode): number {
  return node.children.reduce((acc, c) => acc + 1 + countDescendants(c), 0)
}

// ── Single tree node card ─────────────────────────────────────────────────────
function TreeNode({
  node,
  depth = 0,
  isLast = false,
  onFocusNode,
}: {
  node: MLMTreeNode
  depth?: number
  isLast?: boolean
  onFocusNode?: (node: MLMTreeNode) => void
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const cfg = getLevelCfg(node.level)
  const Icon = cfg.icon
  const hasChildren = node.children && node.children.length > 0
  const totalDescendants = useMemo(() => countDescendants(node), [node])

  return (
    <div className={`relative ${depth > 0 ? 'ml-5' : ''}`}>
      {/* Vertical connector line */}
      {depth > 0 && (
        <div className="absolute left-[-16px] top-0 w-px"
          style={{ background: 'rgba(255,255,255,0.06)', height: isLast ? 24 : '100%' }} />
      )}
      {/* Horizontal connector */}
      {depth > 0 && (
        <div className="absolute left-[-16px] top-6 h-px w-4"
          style={{ background: 'rgba(255,255,255,0.06)' }} />
      )}

      {/* Node card */}
      <div className="mb-2 rounded-xl p-3 transition-all duration-150 group"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1.5px solid ${cfg.border}` }}>
              <Icon className="h-4 w-4" style={{ color: cfg.color }} />
            </div>

            {/* Identity */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white truncate">{node.firstName} {node.lastName}</p>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: cfg.border, color: cfg.color }}>
                  {node.level === 0 ? 'Root' : `L${node.level}`}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">{node.email}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">
                Joined {formatDate(node.joinedAt)} · <span className="font-mono" style={{ color: cfg.color }}>{node.referralCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Mini stats */}
            <div className="hidden sm:flex items-center gap-3 text-right">
              {node.totalOrders > 0 && (
                <div>
                  <p className="text-[10px] text-gray-600 flex items-center gap-1 justify-end"><ShoppingBag className="h-2.5 w-2.5" /> Orders</p>
                  <p className="text-xs font-bold text-white">{node.totalOrders}</p>
                </div>
              )}
              {node.totalEarned > 0 && (
                <div>
                  <p className="text-[10px] text-gray-600 flex items-center gap-1 justify-end"><DollarSign className="h-2.5 w-2.5" /> Earned</p>
                  <p className="text-xs font-bold" style={{ color: '#4ade80' }}>RM {node.totalEarned.toFixed(2)}</p>
                </div>
              )}
              {totalDescendants > 0 && (
                <div>
                  <p className="text-[10px] text-gray-600 flex items-center gap-1 justify-end"><Users className="h-2.5 w-2.5" /> Network</p>
                  <p className="text-xs font-bold" style={{ color: cfg.color }}>{totalDescendants}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Focus button */}
              {onFocusNode && node.level > 0 && (
                <button onClick={() => onFocusNode(node)}
                  className="text-gray-600 hover:text-white transition-colors p-1 opacity-0 group-hover:opacity-100"
                  title="Focus on this node">
                  <TrendingUp className="h-3.5 w-3.5" />
                </button>
              )}
              {/* Expand toggle */}
              {hasChildren && (
                <button onClick={() => setExpanded(v => !v)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cfg.border}`, color: cfg.color }}>
                  {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  {node.children.length}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode
              key={child.userId}
              node={child}
              depth={depth + 1}
              isLast={i === node.children.length - 1}
              onFocusNode={onFocusNode} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Level Analytics ───────────────────────────────────────────────────────────
function LevelAnalytics({ root }: { root: MLMTreeNode }) {
  const stats = useMemo(() => {
    const map: Record<number, { count: number; earned: number; orders: number }> = {}
    function walk(node: MLMTreeNode) {
      if (node.level > 0) {
        if (!map[node.level]) map[node.level] = { count: 0, earned: 0, orders: 0 }
        map[node.level].count++
        map[node.level].earned += node.totalEarned ?? 0
        map[node.level].orders += node.totalOrders ?? 0
      }
      node.children.forEach(walk)
    }
    walk(root)
    return Object.entries(map).map(([level, data]) => ({ level: Number(level), ...data })).sort((a, b) => a.level - b.level)
  }, [root])

  if (!stats.length) return null

  const total = stats.reduce((a, s) => a + s.count, 0)

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Network Analytics by Level</p>
      <div className="space-y-2">
        {stats.map(s => {
          const cfg = getLevelCfg(s.level)
          const pct = total > 0 ? (s.count / total) * 100 : 0
          return (
            <div key={s.level} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black" style={{ color: cfg.color }}>L{s.level}</span>
                  <span className="text-gray-500">{s.count} member{s.count !== 1 ? 's' : ''}</span>
                  {s.earned > 0 && <span className="text-gray-600 text-[10px]">· RM {s.earned.toFixed(2)} earned</span>}
                </div>
                <span className="text-gray-600 text-[10px]">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-900 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {LEVEL_CONFIG.filter((_, i) => i > 0).map((cfg, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
          <span className="text-[11px] text-gray-500">{cfg.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
interface MLMNetworkTreeProps {
  root: MLMTreeNode
  showSummary?: boolean
  showAnalytics?: boolean
}

export function MLMNetworkTree({ root, showSummary = true, showAnalytics = true }: MLMNetworkTreeProps) {
  const [focusedNode, setFocusedNode] = useState<MLMTreeNode | null>(null)
  const displayRoot = focusedNode ?? root
  const total = useMemo(() => countDescendants(root), [root])

  return (
    <div>
      {showSummary && total > 0 && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-gray-400">
              <span className="font-bold text-white">{total}</span> member{total !== 1 ? 's' : ''} in network
            </span>
          </div>
          {focusedNode && (
            <button onClick={() => setFocusedNode(null)}
              className="text-xs px-3 py-1 rounded-lg font-bold"
              style={{ background: 'rgba(233,30,140,0.08)', color: '#D4AF37', border: '1px solid rgba(233,30,140,0.18)' }}>
              ← Back to full tree
            </button>
          )}
        </div>
      )}

      {showAnalytics && <LevelAnalytics root={root} />}

      <div className="mt-4">
        <Legend />
        <div className="overflow-x-auto">
          <TreeNode node={displayRoot} depth={0} onFocusNode={setFocusedNode} />
        </div>
      </div>
    </div>
  )
}
