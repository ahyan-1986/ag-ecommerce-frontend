import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

export type OrderStatusStep =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type ShippingStep = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

interface Step {
  key: string
  label: string
  sublabel?: string
}

const ORDER_STEPS: Step[] = [
  { key: 'paid',       label: 'Payment',    sublabel: 'Confirmed' },
  { key: 'processing', label: 'Processing', sublabel: 'Preparing order' },
  { key: 'packed',     label: 'Packed',     sublabel: 'Ready to ship' },
  { key: 'shipped',    label: 'Shipped',    sublabel: 'On the way' },
  { key: 'delivered',  label: 'Delivered',  sublabel: 'Received' },
]

function resolveStepIndex(orderStatus: string, shippingStatus?: string): number {
  if (orderStatus === 'delivered' || shippingStatus === 'delivered') return 4
  if (orderStatus === 'shipped'   || shippingStatus === 'shipped')   return 3
  if (shippingStatus === 'packed')                                    return 2
  if (orderStatus === 'processing' || shippingStatus === 'picking')  return 1
  if (orderStatus === 'paid')                                         return 0
  return -1 // pending / cancelled / refunded
}

interface OrderTrackingBannerProps {
  orderStatus: string
  shippingStatus?: string
  /** If true, use compact single-row layout (for order cards) */
  compact?: boolean
  /** If true, use light theme for print */
  printMode?: boolean
}

export function OrderTrackingBanner({
  orderStatus,
  shippingStatus,
  compact = false,
  printMode = false,
}: OrderTrackingBannerProps) {
  const isCancelled = orderStatus === 'cancelled' || orderStatus === 'refunded'

  if (isCancelled) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
          printMode
            ? 'border border-red-200 bg-red-50 text-red-700'
            : 'border border-red-800/40 bg-red-900/20 text-red-400'
        }`}
      >
        <Circle className="h-4 w-4 shrink-0" />
        Order {orderStatus === 'refunded' ? 'Refunded' : 'Cancelled'}
      </div>
    )
  }

  const activeIndex = resolveStepIndex(orderStatus, shippingStatus)

  if (compact) {
    return (
      <div className="flex items-center gap-0 w-full overflow-x-auto py-1">
        {ORDER_STEPS.map((step, i) => {
          const done    = i < activeIndex
          const current = i === activeIndex
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'border-green-500 bg-green-500'
                      : current
                      ? 'border-[#D4AF37] bg-[rgba(233,30,140,0.12)] animate-pulse'
                      : 'border-gray-700 bg-transparent'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : current ? (
                    <Loader2 className="h-3 w-3 text-[#D4AF37] animate-spin" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${i > activeIndex ? 'bg-gray-700' : ''}`} />
                  )}
                </div>
                <span
                  className={`text-[9px] mt-0.5 font-semibold whitespace-nowrap uppercase tracking-wide ${
                    done
                      ? 'text-green-400'
                      : current
                      ? 'text-[#D4AF37]'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < ORDER_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${
                    done ? 'bg-green-500' : 'bg-gray-800'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Full mode (receipt page)
  return (
    <div className={`w-full ${printMode ? '' : ''}`}>
      <div className="flex items-start justify-between">
        {ORDER_STEPS.map((step, i) => {
          const done    = i < activeIndex
          const current = i === activeIndex
          const isLast  = i === ORDER_STEPS.length - 1

          return (
            <div key={step.key} className="flex items-start flex-1">
              {/* Step + label column */}
              <div className="flex flex-col items-center flex-1">
                {/* Node + left/right connectors */}
                <div className="flex items-center w-full">
                  {/* Left connector */}
                  <div
                    className={`flex-1 h-0.5 ${
                      i === 0
                        ? 'invisible'
                        : done || current
                        ? printMode ? 'bg-green-500' : 'bg-green-500'
                        : printMode ? 'bg-gray-200' : 'bg-gray-800'
                    }`}
                  />
                  {/* Node */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                      done
                        ? 'border-green-500 bg-green-500'
                        : current
                        ? printMode
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-[#D4AF37] bg-[rgba(212,175,55,0.12)]'
                        : printMode
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-700 bg-transparent'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : current ? (
                      <Loader2
                        className={`h-4 w-4 animate-spin ${
                          printMode ? 'text-yellow-600' : 'text-[#D4AF37]'
                        }`}
                      />
                    ) : (
                      <Circle
                        className={`h-4 w-4 ${
                          printMode ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      />
                    )}
                  </div>
                  {/* Right connector */}
                  <div
                    className={`flex-1 h-0.5 ${
                      isLast
                        ? 'invisible'
                        : done
                        ? printMode ? 'bg-green-500' : 'bg-green-500'
                        : printMode ? 'bg-gray-200' : 'bg-gray-800'
                    }`}
                  />
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-bold ${
                      done
                        ? printMode ? 'text-green-700' : 'text-green-400'
                        : current
                        ? printMode ? 'text-yellow-700' : 'text-[#D4AF37]'
                        : printMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      printMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {step.sublabel}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
