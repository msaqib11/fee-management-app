import { format, startOfMonth, addMonths, isBefore, isAfter, parseISO, differenceInMonths } from 'date-fns'

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
  const admissionParsed = parseISO(admissionDate)
  const admissionMonth = startOfMonth(admissionParsed)

  // Calculate active months based on day-of-month trigger
  // numActiveMonths is 1 (for the admission month) plus any full months since then.
  // differenceInMonths correctly handles the day-of-month check.
  const diffMonths = differenceInMonths(now, admissionParsed)
  const numActiveMonths = Math.max(0, diffMonths + 1)
  const activeEndMonth = addMonths(admissionMonth, numActiveMonths - 1)

  // Build a map of payments by target_month key
  const paymentMap = {}
  for (const p of payments) {
    const key = p.target_month
    if (!paymentMap[key]) {
      paymentMap[key] = 0
    }
    paymentMap[key] += Number(p.amount_paid)
  }

  // Generate months: we show from 3 months before admission to current active month
  const displayStart = addMonths(admissionMonth, -3)
  const months = []
  let cursor = displayStart
  let totalDue = 0
  let totalPaidInLoop = 0

  while (!isAfter(cursor, activeEndMonth)) {
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
      totalPaidInLoop += amountPaid
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

  // Calculate total paid from all payments (including advance or historical)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0)

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
