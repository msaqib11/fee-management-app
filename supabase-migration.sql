-- ============================================
-- Student Fee Management — Supabase Migration
-- ============================================

-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admission_date DATE NOT NULL,
  monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 5000
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  target_month TEXT NOT NULL,            -- format: "2026-05"
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes for fast lookups
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_month ON payments(target_month);

-- Enable RLS with permissive policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
