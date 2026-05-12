const APP_ERROR_EVENT = "app:error";

type AppErrorDetail = {
  message: string;
};

export const emitGlobalError = (message: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AppErrorDetail>(APP_ERROR_EVENT, { detail: { message } }));
};

export const subscribeToGlobalErrors = (handler: (message: string) => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<AppErrorDetail>;
    if (!customEvent.detail || typeof customEvent.detail.message !== "string") return;
    handler(customEvent.detail.message);
  };

  window.addEventListener(APP_ERROR_EVENT, listener as EventListener);

  return () => {
    window.removeEventListener(APP_ERROR_EVENT, listener as EventListener);
  };
};
