import { supabase } from './supabase'

export async function isStudentIdTaken(studentId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_student_id_taken', { p_student_id: studentId })
  if (error) {
    console.error('[studentRegistry] isStudentIdTaken failed:', error.message)
    return false
  }
  return Boolean(data)
}

export async function registerStudentAccount(studentId: string, userId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.rpc('register_student_account', { p_student_id: studentId, p_user_id: userId })
  if (error) {
    console.error('[studentRegistry] registerStudentAccount failed:', error.message)
    return false
  }
  return true
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('email_registered', { p_email: email })
  if (error) {
    console.error('[studentRegistry] isEmailRegistered failed:', error.message)
    return false
  }
  return Boolean(data)
}