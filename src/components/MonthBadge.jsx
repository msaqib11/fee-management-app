import { formatCurrency } from '../utils/feeCalculations'

const statusStyles = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
  red: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25',
  blue: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
}

const statusDots = {
  green: 'bg-emerald-400',
  red: 'bg-red-400',
  blue: 'bg-indigo-400',
}

export default function MonthBadge({ month, onClick }) {
  const isClickable = !month.isBeforeAdmission

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => isClickable && onClick(month)}
      className={`
        relative flex flex-col items-center justify-center
        min-w-[5rem] px-3 py-2.5 rounded-xl border
        text-xs font-medium transition-all duration-200
        scroll-snap-align-start
        ${statusStyles[month.status]}
        ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-60'}
      `}
      title={`${month.label} — ${month.status === 'blue' ? 'Before admission' : month.status === 'green' ? 'Paid' : 'Unpaid/Partial'}`}
    >
      {/* Status dot */}
      <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${statusDots[month.status]}`} />

      {/* Month label */}
      <span className="font-semibold text-[0.7rem] leading-tight">
        {month.label.split(' ')[0]}
      </span>
      <span className="text-[0.6rem] opacity-70 leading-tight">
        {month.label.split(' ')[1]}
      </span>

      {/* Partial payment indicator */}
      {month.status === 'red' && month.amountPaid > 0 && (
        <span className="mt-1 text-[0.55rem] font-medium bg-red-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
          {formatCurrency(month.amountPaid)}
        </span>
      )}

      {/* Full payment check */}
      {month.status === 'green' && (
        <span className="mt-0.5 text-[0.6rem]">✓</span>
      )}
    </button>
  )
}
