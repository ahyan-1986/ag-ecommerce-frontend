type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  variant?: BadgeVariant
  children: React.ReactNode
}

const colours: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

export function Badge({ variant = 'default', children }: Props) {
  return <span className={`badge ${colours[variant]}`}>{children}</span>
}

export function orderStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    pending: 'warning',
    paid: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
    refunded: 'danger',
  }
  return map[status] ?? 'default'
}
