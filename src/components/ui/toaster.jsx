import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

const TOAST_DURATION = 3000;

function AutoDismissToast({ id, title, description, action, dismiss, ...props }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => dismiss(id), TOAST_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [id]);

  return (
    <Toast {...props}>
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      {action}
      <ToastClose />
    </Toast>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <AutoDismissToast
          key={id}
          id={id}
          title={title}
          description={description}
          action={action}
          dismiss={dismiss}
          {...props}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}