import { useState } from 'react'
import { X, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/feeCalculations'
import { format } from 'date-fns'

export default function PaymentModal({ student, month, onClose, onSuccess }) {
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remaining = month.fee - month.amountPaid
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const amount = Number(amountPaid)
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    setLoading(true)
    const { error: insertError } = await supabase.from('payments').insert({
      student_id: student.id,
      target_month: month.key,
      amount_paid: amount,
      payment_date: paymentDate,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Record Payment</h3>
              <p className="text-xs text-slate-400">{student.name} — {month.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center hover:bg-slate-600/50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Info Bar */}
        <div className="px-6 py-3 bg-slate-750 border-b border-slate-700/30 flex items-center justify-between text-xs">
          <span className="text-slate-400">Monthly Fee: <span className="text-slate-200 font-medium">{formatCurrency(month.fee)}</span></span>
          <span className="text-slate-400">Already Paid: <span className="text-emerald-400 font-medium">{formatCurrency(month.amountPaid)}</span></span>
          <span className="text-slate-400">Due: <span className="text-red-400 font-semibold">{formatCurrency(remaining)}</span></span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="payment-amount"
                type="number"
                min="1"
                step="any"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={`Up to ${remaining}`}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Payment Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                'Save Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
