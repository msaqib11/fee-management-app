import { useState, useEffect, useCallback } from 'react'
import { GraduationCap, Plus, RefreshCw, Search, LogOut, Eye, EyeOff, Users, TrendingUp, Wallet } from 'lucide-react'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import StudentTable from './components/StudentTable'
import StudentCard from './components/StudentCard'
import PaymentModal from './components/PaymentModal'
import AddStudentModal from './components/AddStudentModal'
import EditStudentModal from './components/EditStudentModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import { calculateDues, formatCurrency } from './utils/feeCalculations'
import { startOfMonth, parseISO, isBefore } from 'date-fns'

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [showIncome, setShowIncome] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch all students with their payments
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*, payments(*)')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching students:', error)
    } else {
      setStudents(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchStudents()
  }, [session, fetchStudents])

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Calculate stats and filter students
  const currentMonthStart = startOfMonth(new Date())
  
  const stats = students.reduce((acc, s) => {
    const dues = calculateDues(s.admission_date, Number(s.monthly_fee), s.payments || [])
    acc.totalBalance += dues.balance
    acc.totalMonthlyIncome += Number(s.monthly_fee)
    
    const thisMonthPayments = (s.payments || []).filter(p => !isBefore(parseISO(p.payment_date), currentMonthStart))
    acc.thisMonthCollection += thisMonthPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0)
    
    if (dues.balance > 0) acc.unpaidCount++
    return acc
  }, { totalBalance: 0, totalMonthlyIncome: 0, thisMonthCollection: 0, unpaidCount: 0 })

  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (showAll) return true
    const dues = calculateDues(s.admission_date, Number(s.monthly_fee), s.payments || [])
    return dues.balance > 0
  })

  // Handlers
  const handleBadgeClick = (student, month) => setPaymentTarget({ student, month })
  const handlePaymentSuccess = () => { setPaymentTarget(null); fetchStudents() }
  const handleAddSuccess = () => { setShowAddModal(false); fetchStudents() }
  const handleEditSuccess = () => { setEditTarget(null); fetchStudents() }
  const handleDeleteSuccess = () => { setDeleteTarget(null); fetchStudents() }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 pointer-events-none" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      </div>
    )
  }

  // Not logged in → show auth page
  if (!session) {
    return <AuthPage />
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Fee Management
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchStudents}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Student</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="search-students"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/40 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowAll(!showAll)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                !showAll 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }`}
            >
              <Users className="w-4 h-4" />
              {showAll ? 'Showing All' : 'Unpaid Only'}
            </button>
          </div>
        </header>

        {/* Loading state */}
        {loading && students.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-500">Loading students…</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl px-5 py-4 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-slate-500/20 group-hover:text-indigo-500/20 transition-colors pointer-events-none">
                  <TrendingUp className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.65rem] text-slate-400 uppercase tracking-widest font-semibold">Monthly Income</span>
                  <button 
                    onClick={() => setShowIncome(!showIncome)}
                    className="p-1 hover:bg-slate-700/50 rounded-md transition-colors text-slate-500 hover:text-slate-300"
                  >
                    {showIncome ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                  {showIncome ? formatCurrency(stats.totalMonthlyIncome) : '••••••'}
                </p>
                <div className="mt-2 h-1 w-full bg-slate-700/30 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl px-5 py-4 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-slate-500/20 group-hover:text-emerald-500/20 transition-colors pointer-events-none">
                  <Wallet className="w-12 h-12" />
                </div>
                <span className="text-[0.65rem] text-slate-400 uppercase tracking-widest font-semibold">This Month Collection</span>
                <p className="text-xl font-bold text-emerald-400 mt-1 font-mono tracking-tight">
                  {formatCurrency(stats.thisMonthCollection)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-slate-700/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (stats.thisMonthCollection / stats.totalMonthlyIncome) * 100)}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {Math.round((stats.thisMonthCollection / stats.totalMonthlyIncome) * 100) || 0}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl px-5 py-4 relative group overflow-hidden shadow-lg shadow-indigo-500/5">
                <div className="absolute top-0 right-0 p-3 text-slate-500/20 group-hover:text-red-500/20 transition-colors pointer-events-none">
                  {/* Icon removed to debug ReferenceError */}
                </div>
                <span className="text-[0.65rem] text-indigo-400 uppercase tracking-widest font-bold">Total Balance</span>
                <p className={`text-xl font-bold mt-1 font-mono tracking-tight ${stats.totalBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(stats.totalBalance)}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  Across {stats.unpaidCount} students
                </p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl px-5 py-4 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-slate-500/20 group-hover:text-slate-300/20 transition-colors pointer-events-none">
                  <Users className="w-12 h-12" />
                </div>
                <span className="text-[0.65rem] text-slate-400 uppercase tracking-widest font-semibold">Students</span>
                <p className="text-xl font-bold text-slate-100 mt-1 font-mono tracking-tight">
                  {filtered.length} / {students.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {showAll ? 'Viewing all registered' : 'Showing only unpaid'}
                </p>
              </div>
            </div>

            {/* Desktop Table */}
            <StudentTable
              students={filtered}
              onBadgeClick={handleBadgeClick}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />

            {/* Mobile Cards */}
            <StudentCard
              students={filtered}
              onBadgeClick={handleBadgeClick}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {paymentTarget && (
        <PaymentModal
          student={paymentTarget.student}
          month={paymentTarget.month}
          onClose={() => setPaymentTarget(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {editTarget && (
        <EditStudentModal
          student={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          student={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}
