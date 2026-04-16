import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const TOAST_DURATION = 8000; // 8 segundos

export function Toaster() {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    toasts.forEach((t) => {
      if (t.open) {
        const timer = setTimeout(() => dismiss(t.id), TOAST_DURATION);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}