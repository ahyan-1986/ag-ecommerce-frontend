import type { ReactNode, CSSProperties } from 'react'

interface Props {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Card({ title, description, children, className = '', style }: Props) {
  return (
    <div className={`card ${className}`} style={style}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
