import { format, startOfMonth, addMonths, isBefore, isAfter, parseISO } from 'date-fns'

/**
 * Calculates dues, payment statuses, and generates month-by-month breakdown.
 *
 * @param {string} admissionDate - ISO date string (e.g., "2025-09-15")
 * @param {number} monthlyFee - Monthly fee amount
 * @param {Array} payments - Array of payment objects { target_month, amount_paid }
 * @returns {{ months: Array, totalDue: number, totalPaid: number, balance: number }}
 */
export function calculateDues(admissionDate, monthlyFee, payments = []) {
  const now = new Date()
  const currentMonth = startOfMonth(now)
  const admissionParsed = parseISO(admissionDate)
  const admissionMonth = startOfMonth(admissionParsed)

  // Build a map of payments by target_month key
  const paymentMap = {}
  for (const p of payments) {
    const key = p.target_month
    if (!paymentMap[key]) {
      paymentMap[key] = 0
    }
    paymentMap[key] += Number(p.amount_paid)
  }

  // Generate months: we show from 3 months before admission to current month
  // Months before admission are "blue", months from admission onward are active
  const displayStart = addMonths(admissionMonth, -3)
  const months = []
  let cursor = displayStart
  let totalDue = 0
  let totalPaid = 0

  while (!isAfter(cursor, currentMonth)) {
    const key = format(cursor, 'yyyy-MM')
    const label = format(cursor, 'MMM yyyy')
    const amountPaid = paymentMap[key] || 0
    const isBeforeAdmission = isBefore(cursor, admissionMonth)

    let status
    if (isBeforeAdmission) {
      status = 'blue'
    } else if (amountPaid >= monthlyFee) {
      status = 'green'
    } else {
      status = 'red'
    }

    if (!isBeforeAdmission) {
      totalDue += monthlyFee
      totalPaid += amountPaid
    }

    months.push({
      key,
      label,
      status,
      amountPaid,
      fee: monthlyFee,
      isBeforeAdmission,
    })

    cursor = addMonths(cursor, 1)
  }

  return {
    months,
    totalDue,
    totalPaid,
    balance: totalDue - totalPaid,
  }
}

/**
 * Formats a number as currency (PKR style).
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
