import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Employee = {
  id: string
  auth_user_id?: string
  employee_id: string
  email: string
  password_hash: string
  role: 'admin' | 'hr' | 'employee'
  first_name: string
  last_name: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  profile_picture?: string
  department?: string
  designation?: string
  join_date?: string
  employment_type: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export type Attendance = {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'half-day' | 'leave'
  notes?: string
  created_at: string
}

export type LeaveType = {
  id: string
  name: string
  description?: string
  max_days_per_year: number
  is_paid: boolean
  created_at: string
}

export type LeaveRequest = {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  total_days: number
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  review_comment?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  leave_type?: LeaveType
  employee?: Employee
}

export type LeaveBalance = {
  id: string
  employee_id: string
  leave_type_id: string
  year: number
  total_days: number
  used_days: number
  remaining_days: number
  leave_type?: LeaveType
}

export type SalaryStructure = {
  id: string
  employee_id: string
  basic_salary: number
  housing_allowance: number
  transport_allowance: number
  medical_allowance: number
  other_allowances: number
  tax_deduction: number
  insurance_deduction: number
  other_deductions: number
  effective_date: string
  created_at: string
  updated_at: string
}

export type Payroll = {
  id: string
  employee_id: string
  month: number
  year: number
  basic_salary: number
  allowances: number
  deductions: number
  bonus: number
  net_salary: number
  payment_status: 'pending' | 'processed' | 'paid'
  payment_date?: string
  notes?: string
  created_at: string
  updated_at: string
}
