import { supabase, Employee } from './supabase'

export async function loginUser(email: string, password: string): Promise<{ success: boolean; employee?: Employee; error?: string }> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email)
    .eq('password_hash', password)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return { success: false, error: 'Invalid email or password' }
  }

  return { success: true, employee: data }
}

export async function registerUser(userData: {
  employee_id: string
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'admin' | 'hr' | 'employee'
}): Promise<{ success: boolean; employee?: Employee; error?: string }> {
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .or(`email.eq.${userData.email},employee_id.eq.${userData.employee_id}`)
    .single()

  if (existing) {
    return { success: false, error: 'Email or Employee ID already exists' }
  }

  const { data, error } = await supabase
    .from('employees')
    .insert({
      employee_id: userData.employee_id,
      email: userData.email,
      password_hash: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, employee: data }
}

export function setUserSession(employee: Employee) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dayflow_user', JSON.stringify(employee))
  }
}

export function getUserSession(): Employee | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('dayflow_user')
    return user ? JSON.parse(user) : null
  }
  return null
}

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dayflow_user')
  }
}

export function isAdmin(employee: Employee | null): boolean {
  return employee?.role === 'admin' || employee?.role === 'hr'
}
