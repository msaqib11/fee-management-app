import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DeleteConfirmModal({ student, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', student.id)

    if (deleteError) {
      setError(deleteError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-100 mb-1">Delete Student</h3>
          <p className="text-sm text-slate-400 mb-1">
            Are you sure you want to delete <span className="font-medium text-slate-200">{student.name}</span>?
          </p>
          <p className="text-xs text-slate-500">
            This will also delete all their payment records. This action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="mx-6 mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={loading} className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 disabled:opacity-50 transition-all active:scale-[0.98]">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</span> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
