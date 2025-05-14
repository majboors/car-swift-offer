
// Re-export from our custom toast implementation
import { toast as sonnerToast, useToast as useSonnerToast } from "sonner";
import type { Toast } from "sonner";

const useToast = useSonnerToast;

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
}: ToastProps): Toast => {
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
