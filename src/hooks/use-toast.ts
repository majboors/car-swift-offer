

// Re-export from our custom toast implementation
import { toast as sonnerToast } from "sonner";

// The useToast function to match shadcn/ui expected interface
const useToast = () => {
  // Get toasts from the store (this is a simple version that doesn't actually track toasts)
  return {
    toasts: [] as any[],
    toast,
    dismiss: (id?: string) => {
      if (id) {
        sonnerToast.dismiss(id);
      }
    },
  };
};

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Wrapper for toast to match shadcn/ui expected interface
const toast = ({ 
  title, 
  description, 
  variant = "default",
  duration = 5000,
  action
}: ToastProps) => {
  // Use conditionals instead of bracket notation for toast types
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  } else if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  } else if (variant === "warning") {
    return sonnerToast.warning(title, {
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  } else {
    return sonnerToast(title, {
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  }
};

export { useToast, toast };

