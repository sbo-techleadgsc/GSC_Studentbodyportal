export const STUDENT_ID_REGEX = /^[A-Z]{2}-\d{5}$/
export const STUDENT_ID_FORMAT = 'XX-XXXXX'
export const STUDENT_ID_PLACEHOLDER = 'XX-XXXXX (e.g., AB-12345)'

export function normalizeStudentId(id: string): string {
  return id.trim().toUpperCase()
}

export function isValidStudentId(id: string): boolean {
  return STUDENT_ID_REGEX.test(normalizeStudentId(id))
}