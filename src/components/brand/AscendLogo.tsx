interface AscendLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
}

export function AscendLogo({ size = 'md', showTagline = false, className = '' }: AscendLogoProps) {
  const iconDim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  const titleCls = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`${iconDim} rounded-2xl shadow-coral-sm flex items-center justify-center shrink-0 overflow-hidden`}>
        <svg viewBox="0 0 64 64" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ascendGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5A36" />
              <stop offset="52%" stopColor="#FFB800" />
              <stop offset="100%" stopColor="#00C896" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="18" fill="url(#ascendGrad)" />
          {/* Ascending peak / chevron mark */}
          <path
            d="M15 45L32 15L49 45H39.5L32 30.5L24.5 45H15Z"
            fill="#FFFFFF"
          />
          {/* Rising energy spark dot */}
          <circle cx="32" cy="45" r="4.5" fill="#FFFFFF" />
        </svg>
      </div>
      <div className="leading-none">
        <div className={`font-extrabold tracking-tight flex items-baseline gap-1 ${titleCls}`}>
          <span className="bg-gradient-to-r from-[#FF5A36] via-[#FF8A00] to-[#00C896] bg-clip-text text-transparent">
            ASCEND
          </span>
          <span className="text-slate-800">GROUP</span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-0.5">
            Rise • Glow • Reward
          </p>
        )}
      </div>
    </div>
  )
}
