
// Re-export from our custom toast implementation
import { toast as sonnerToast } from "sonner";
import type { ToastT } from "sonner";

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
  variant?: "default" | "destructive";
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
  const toastType = variant === "destructive" ? "error" : "default";
  
  return sonnerToast[toastType](title, {
    description,
    duration,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  });
};

export { useToast, toast };
