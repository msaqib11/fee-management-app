import { format, parseISO } from 'date-fns'
import { CalendarDays, Banknote, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import MonthBadge from './MonthBadge'
import { calculateDues, formatCurrency } from '../utils/feeCalculations'

export default function StudentTable({ students, onBadgeClick, onEdit, onDelete }) {
  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-800/80">
            <th className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
            <th className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admission</th>
            <th className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fee</th>
            <th className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Months</th>
            <th className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Balance</th>
            <th className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const dues = calculateDues(student.admission_date, Number(student.monthly_fee), student.payments || [])
            return (
              <tr key={student.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-100 truncate">{student.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {format(parseISO(student.admission_date), 'dd MMM yyyy')}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                    <Banknote className="w-3.5 h-3.5 text-slate-500" />
                    {formatCurrency(student.monthly_fee)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[28rem] scrollbar-thin">
                    {dues.months.map((m) => (
                      <MonthBadge key={m.key} month={m} onClick={() => onBadgeClick(student, m)} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-sm font-bold ${dues.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {dues.balance > 0 && <TrendingDown className="w-3.5 h-3.5 inline mr-1" />}
                    {formatCurrency(dues.balance)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                      title="Edit student"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(student)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-800/60 font-bold border-t border-slate-700/50">
            <td colSpan="4" className="px-5 py-4 text-right text-slate-400 text-xs uppercase tracking-wider">
              Total Outstanding Balance
            </td>
            <td className="px-5 py-4 text-right">
              {(() => {
                const total = students.reduce((acc, s) => {
                  const dues = calculateDues(s.admission_date, Number(s.monthly_fee), s.payments || [])
                  return acc + dues.balance
                }, 0)
                return (
                  <span className={`text-sm ${total > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(total)}
                  </span>
                )
              })()}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      {students.length === 0 && (
        <div className="py-16 text-center text-slate-500 text-sm">No students found. Add one to get started.</div>
      )}
    </div>
  )
}
