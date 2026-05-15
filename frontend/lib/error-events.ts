const APP_ERROR_EVENT = "app:error";
const APP_NOTIFICATION_EVENT = "app:notification";

type AppErrorDetail = {
  message: string;
};

type AppNotificationDetail = {
  message: string;
  sender: string;
};

export const emitGlobalError = (message: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AppErrorDetail>(APP_ERROR_EVENT, { detail: { message } }));
};

export const emitGlobalNotification = (message: string, sender: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AppNotificationDetail>(APP_NOTIFICATION_EVENT, { detail: { message, sender } }));
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

export const subscribeToGlobalNotifications = (handler: (message: string, sender: string) => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<AppNotificationDetail>;
    if (!customEvent.detail || typeof customEvent.detail.message !== "string" || typeof customEvent.detail.sender !== "string") return;
    handler(customEvent.detail.message, customEvent.detail.sender);
  };

  window.addEventListener(APP_NOTIFICATION_EVENT, listener as EventListener);

  return () => {
    window.removeEventListener(APP_NOTIFICATION_EVENT, listener as EventListener);
  };
};
