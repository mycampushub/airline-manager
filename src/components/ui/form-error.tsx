import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string
  showIcon?: boolean
}

/**
 * FormError component for displaying validation errors consistently across the application.
 * 
 * @example
 * ```tsx
 * <FormError message={errors.email} />
 * <FormError message="This field is required" showIcon={true} />
 * ```
 */
const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, message, showIcon = false, ...props }, ref) => {
    if (!message) {
      return null
    }

    return (
      <p
        ref={ref}
        className={cn(
          "text-xs text-destructive flex items-start gap-1 mt-1",
          className
        )}
        {...props}
      >
        {showIcon && <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />}
        <span>{message}</span>
      </p>
    )
  }
)

FormError.displayName = "FormError"

export { FormError }
