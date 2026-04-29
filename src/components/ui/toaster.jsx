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

const TOAST_DURATION = 1500;

function AutoDismissToast({ id, title, description, action, dismiss, ...props }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(id);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line

  return (
    <Toast {...props}>
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      {action}
      <ToastClose onClick={() => dismiss(id)} />
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