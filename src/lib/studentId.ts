export const STUDENT_ID_REGEX = /^\d{2}-\d{5}$/
export const STUDENT_ID_FORMAT = 'XX-XXXXX'
export const STUDENT_ID_PLACEHOLDER = 'XX-XXXXX (e.g., 00-00000)'

export function normalizeStudentId(id: string): string {
  return id.trim()
}

export function isValidStudentId(id: string): boolean {
  return STUDENT_ID_REGEX.test(normalizeStudentId(id))
}