import { format, parseISO } from 'date-fns'
import { CalendarDays, Banknote, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import MonthBadge from './MonthBadge'
import { calculateDues, formatCurrency } from '../utils/feeCalculations'

export default function StudentCard({ students, onBadgeClick, onEdit, onDelete }) {
  return (
    <div className="md:hidden space-y-4">
      {students.map((student) => {
        const dues = calculateDues(student.admission_date, Number(student.monthly_fee), student.payments || [])
        return (
          <div key={student.id} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{student.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[0.65rem] text-slate-400">
                      <CalendarDays className="w-3 h-3" />
                      {format(parseISO(student.admission_date), 'dd MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1 text-[0.65rem] text-slate-400">
                      <Banknote className="w-3 h-3" />
                      {formatCurrency(student.monthly_fee)}/mo
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(student)} className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(student)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Swipeable Month Badges */}
            <div className="px-5 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                {dues.months.map((m) => (
                  <MonthBadge key={m.key} month={m} onClick={() => onBadgeClick(student, m)} />
                ))}
              </div>
            </div>

            {/* Footer stats */}
            <div className="px-5 py-3 border-t border-slate-700/30 bg-slate-800/40 flex items-center justify-between text-[0.65rem]">
              <span className="text-slate-500">Total Due: <span className="text-slate-300 font-medium">{formatCurrency(dues.totalDue)}</span></span>
              <span className="text-slate-500">Paid: <span className="text-emerald-400 font-medium">{formatCurrency(dues.totalPaid)}</span></span>
              <span className={`font-bold ${dues.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {dues.balance > 0 && <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                {formatCurrency(dues.balance)}
              </span>
            </div>
          </div>
        )
      })}
      {students.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-sm">No students found. Add one to get started.</div>
      )}
    </div>
  )
}
