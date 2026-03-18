import * as React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean
  /**
   * Text to display when loading (defaults to "Loading...")
   */
  loadingText?: string
  /**
   * Icon to use for loading state (defaults to RefreshCw)
   */
  loadingIcon?: "spinner" | "refresh"
  /**
   * Show icon on the right side of text
   */
  iconRight?: boolean
}

/**
 * LoadingButton component for consistent loading states across the application.
 * Automatically handles disabling and showing loading state with icon.
 * 
 * @example
 * ```tsx
 * <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
 *   Submit
 * </LoadingButton>
 * 
 * <LoadingButton 
 *   loading={isSaving} 
 *   loadingText="Saving..." 
 *   loadingIcon="spinner"
 * >
 *   Save Changes
 * </LoadingButton>
 * ```
 */
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      loadingIcon = "refresh",
      iconRight = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const LoadingIcon = loadingIcon === "spinner" ? Loader2 : RefreshCw

    const icon = (
      <LoadingIcon
        className={cn(
          "h-4 w-4",
          iconRight ? "ml-2" : "mr-2",
          "animate-spin"
        )}
      />
    )

    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(className)}
        {...props}
      >
        {loading && !iconRight && icon}
        {loading && loadingText ? loadingText : children}
        {loading && iconRight && icon}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
