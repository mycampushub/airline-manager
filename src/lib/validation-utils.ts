/**
 * Validation utility functions for consistent form validation across the application.
 * 
 * @example
 * ```tsx
 * import { validateRequired, validateEmail, validatePhone, validateForm } from '@/lib/validation-utils'
 * 
 * const errors = validateForm({
 *   email: validateEmail(email),
 *   phone: validatePhone(phone),
 *   name: validateRequired(name, 'Name is required'),
 * })
 * 
 * if (hasErrors(errors)) {
 *   setErrors(errors)
 *   return
 * }
 * ```
 */

/**
 * Check if a value is empty (null, undefined, empty string, or whitespace only)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * Validate that a field is not empty
 */
export function validateRequired(
  value: unknown,
  message: string = "This field is required"
): string | undefined {
  return isEmpty(value) ? message : undefined
}

/**
 * Validate email format
 */
export function validateEmail(
  email: string,
  message: string = "Please enter a valid email address"
): string | undefined {
  if (isEmpty(email)) return message
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !emailRegex.test(email) ? message : undefined
}

/**
 * Validate phone number format
 */
export function validatePhone(
  phone: string,
  message: string = "Please enter a valid phone number"
): string | undefined {
  if (isEmpty(phone)) return message
  
  // Accept various phone formats with optional country code, spaces, dashes, parentheses
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  return !phoneRegex.test(phone) ? message : undefined
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: string,
  min: number,
  message?: string
): string | undefined {
  if (isEmpty(value)) return undefined
  const actualMessage = message || `Must be at least ${min} characters`
  return value.length < min ? actualMessage : undefined
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: string,
  max: number,
  message?: string
): string | undefined {
  if (isEmpty(value)) return undefined
  const actualMessage = message || `Must be no more than ${max} characters`
  return value.length > max ? actualMessage : undefined
}

/**
 * Validate numeric value
 */
export function validateNumber(
  value: unknown,
  message: string = "Please enter a valid number"
): string | undefined {
  if (isEmpty(value)) return message
  
  const num = Number(value)
  return isNaN(num) ? message : undefined
}

/**
 * Validate minimum value
 */
export function validateMin(
  value: number | string,
  min: number,
  message?: string
): string | undefined {
  const num = Number(value)
  if (isNaN(num)) return "Invalid number"
  const actualMessage = message || `Must be at least ${min}`
  return num < min ? actualMessage : undefined
}

/**
 * Validate maximum value
 */
export function validateMax(
  value: number | string,
  max: number,
  message?: string
): string | undefined {
  const num = Number(value)
  if (isNaN(num)) return "Invalid number"
  const actualMessage = message || `Must be no more than ${max}`
  return num > max ? actualMessage : undefined
}

/**
 * Validate that two fields match (e.g., password confirmation)
 */
export function validateMatch(
  value1: string,
  value2: string,
  message: string = "Values do not match"
): string | undefined {
  return value1 !== value2 ? message : undefined
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(
  date: string | Date,
  message: string = "Date must be in the future"
): string | undefined {
  if (isEmpty(date)) return undefined
  
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj < new Date() ? message : undefined
}

/**
 * Validate date is not in the future
 */
export function validatePastDate(
  date: string | Date,
  message: string = "Date must be in the past"
): string | undefined {
  if (isEmpty(date)) return undefined
  
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj > new Date() ? message : undefined
}

/**
 * Validate URL format
 */
export function validateUrl(
  url: string,
  message: string = "Please enter a valid URL"
): string | undefined {
  if (isEmpty(url)) return message
  
  try {
    new URL(url)
    return undefined
  } catch {
    return message
  }
}

/**
 * Type for validation errors object
 */
export type ValidationErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>

/**
 * Build validation errors object from individual field validations
 */
export function validateForm<T extends Record<string, unknown>>(
  validations: Partial<Record<keyof T, string | undefined>>
): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {}
  
  for (const [field, error] of Object.entries(validations)) {
    if (error) {
      errors[field as keyof T] = error
    }
  }
  
  return errors
}

/**
 * Check if there are any validation errors
 */
export function hasErrors<T extends Record<string, unknown>>(
  errors: ValidationErrors<T>
): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Get the first error message from a validation errors object
 */
export function getFirstError<T extends Record<string, unknown>>(
  errors: ValidationErrors<T>
): string | undefined {
  return Object.values(errors)[0]
}

/**
 * Clear a specific field error
 */
export function clearFieldError<T extends Record<string, unknown>>(
  errors: ValidationErrors<T>,
  field: keyof T
): ValidationErrors<T> {
  const newErrors = { ...errors }
  delete newErrors[field]
  return newErrors
}

/**
 * Clear all errors
 */
export function clearAllErrors<T extends Record<string, unknown>>(): ValidationErrors<T> {
  return {}
}

/**
 * Validate a field with multiple validators
 */
export function validateWithValidators(
  value: unknown,
  validators: Array<(value: unknown) => string | undefined>
): string | undefined {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return undefined
}
