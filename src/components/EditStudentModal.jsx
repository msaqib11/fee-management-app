import { useState } from 'react'
import { X, Pencil, Calendar, Banknote } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function EditStudentModal({ student, onClose, onSuccess }) {
  const [name, setName] = useState(student.name)
  const [admissionDate, setAdmissionDate] = useState(student.admission_date)
  const [monthlyFee, setMonthlyFee] = useState(String(student.monthly_fee))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Student name is required.'); return }
    if (!admissionDate) { setError('Admission date is required.'); return }
    if (!monthlyFee || Number(monthlyFee) <= 0) { setError('Enter a valid monthly fee.'); return }

    setLoading(true)
    const { error: updateError } = await supabase
      .from('students')
      .update({
        name: name.trim(),
        admission_date: admissionDate,
        monthly_fee: Number(monthlyFee),
      })
      .eq('id', student.id)

    if (updateError) { setError(updateError.message); setLoading(false); return }
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Edit Student</h3>
              <p className="text-xs text-slate-400">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center hover:bg-slate-600/50 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Student Name</label>
            <input id="edit-student-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Admission Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="edit-admission-date" type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Monthly Fee</label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input id="edit-monthly-fee" type="number" min="1" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            </div>
          </div>
          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-500 disabled:opacity-50 transition-all active:scale-[0.98]">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
