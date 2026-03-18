import { toast } from "@/hooks/use-toast"

/**
 * Toast utility functions for consistent notifications across the application.
 * 
 * @example
 * ```tsx
 * import { toastSuccess, toastError, toastInfo, toastWarning } from '@/lib/toast-utils'
 * 
 * toastSuccess('Operation completed', 'Data saved successfully')
 * toastError('Error', 'Something went wrong')
 * toastInfo('Info', 'Please check your input')
 * toastWarning('Warning', 'This action cannot be undone')
 * ```
 */

/**
 * Show a success toast notification
 */
export function toastSuccess(
  title: string,
  description?: string,
  options?: {
    duration?: number
  }
) {
  return toast({
    title,
    description,
    duration: options?.duration,
  })
}

/**
 * Show an error toast notification with destructive variant
 */
export function toastError(
  title: string = "Error",
  description?: string,
  options?: {
    duration?: number
  }
) {
  return toast({
    title,
    description,
    variant: "destructive",
    duration: options?.duration,
  })
}

/**
 * Show an info toast notification
 */
export function toastInfo(
  title: string,
  description?: string,
  options?: {
    duration?: number
  }
) {
  return toast({
    title,
    description,
    duration: options?.duration,
  })
}

/**
 * Show a warning toast notification
 */
export function toastWarning(
  title: string,
  description?: string,
  options?: {
    duration?: number
  }
) {
  return toast({
    title,
    description,
    duration: options?.duration,
  })
}

/**
 * Show a toast notification for loading state
 */
export function toastLoading(
  title: string,
  description?: string
) {
  return toast({
    title,
    description,
  })
}

/**
 * Show a toast notification for validation errors
 */
export function toastValidationError(message: string = "Please fix the errors before submitting") {
  return toastError("Validation Error", message)
}

/**
 * Show a toast notification for successful creation
 */
export function toastCreated(entityName: string, identifier?: string) {
  const description = identifier 
    ? `${entityName} "${identifier}" has been created`
    : `${entityName} has been created`
  return toastSuccess("Created", description)
}

/**
 * Show a toast notification for successful update
 */
export function toastUpdated(entityName: string, identifier?: string) {
  const description = identifier
    ? `${entityName} "${identifier}" has been updated`
    : `${entityName} has been updated`
  return toastSuccess("Updated", description)
}

/**
 * Show a toast notification for successful deletion
 */
export function toastDeleted(entityName: string, identifier?: string) {
  const description = identifier
    ? `${entityName} "${identifier}" has been deleted`
    : `${entityName} has been deleted`
  return toastSuccess("Deleted", description)
}

/**
 * Show a toast notification for API errors
 */
export function toastApiError(error?: unknown, defaultMessage?: string) {
  const message = error instanceof Error ? error.message : defaultMessage || "An error occurred"
  return toastError("API Error", message)
}

/**
 * Show a toast notification for network errors
 */
export function toastNetworkError() {
  return toastError("Network Error", "Unable to connect to the server. Please check your internet connection.")
}

/**
 * Show a toast notification for unauthorized access
 */
export function toastUnauthorized() {
  return toastError("Unauthorized", "You don't have permission to perform this action.")
}

/**
 * Show a toast notification for form validation
 */
export function toastFormValidation(
  errors: Record<string, string>,
  fieldName?: string
) {
  if (fieldName && errors[fieldName]) {
    return toastValidationError(errors[fieldName])
  }
  
  const firstError = Object.values(errors)[0]
  if (firstError) {
    return toastValidationError(firstError)
  }
  
  return toastValidationError()
}
