"use client";

import { useCallback, useEffect, useState } from "react";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import { subscribeToGlobalErrors, subscribeToGlobalNotifications } from "@/lib/error-events";

const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred.";
const NETWORK_ERROR_MESSAGE = "Network error. Please try again.";

const normalizeErrorMessage = (message?: string): string => {
  if (!message) return DEFAULT_ERROR_MESSAGE;
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_ERROR_MESSAGE;
};

const getRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

const isApiRequest = (input: RequestInfo | URL): boolean => {
  const url = getRequestUrl(input);
  return url.startsWith("/api/") || url.includes("/api/");
};

const getErrorMessageFromResponse = async (response: Response): Promise<string | null> => {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.clone().json()) as Record<string, unknown>;
      const error = payload.error;
      const message = payload.message;

      if (typeof error === "string" && error.trim().length > 0) {
        return error;
      }

      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }

      return null;
    }

    const text = (await response.clone().text()).trim();
    if (text.length > 0 && text.length <= 180) {
      return text;
    }
  } catch {
    return null;
  }

  return null;
};

type ErrorNotification = {
  id: string;
  message: string;
};

type NormalNotification = {
  id: string;
  message: string;
  sender: string;
};

type QueuedNotification = (ErrorNotification | NormalNotification) & { variant: "error" | "default" };

export default function GlobalErrorNotifications() {
  const [notifications, setNotifications] = useState<QueuedNotification[]>([]);
  const nextIdRef = useCallback(() => Math.random().toString(36).slice(2), []);

  const showError = useCallback((message?: string) => {
    const normalizedMessage = normalizeErrorMessage(message);
    const newNotif: QueuedNotification = {
      id: nextIdRef(),
      message: normalizedMessage,
      variant: "error",
    } as QueuedNotification;
    setNotifications((prev) => [...prev, newNotif]);

    const timeoutId = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 4500);

    return () => clearTimeout(timeoutId);
  }, [nextIdRef]);

  const showNotification = useCallback((message: string, sender: string) => {
    const newNotif: QueuedNotification = {
      id: nextIdRef(),
      message,
      sender,
      variant: "default",
    } as QueuedNotification;
    setNotifications((prev) => [...prev, newNotif]);

    const timeoutId = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 4500);

    return () => clearTimeout(timeoutId);
  }, [nextIdRef]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);

        if (!response.ok && isApiRequest(input)) {
          const message = await getErrorMessageFromResponse(response);
          showError(message ?? `Request failed (${response.status})`);
        }

        return response;
      } catch (error) {
        if (isApiRequest(input)) {
          showError(NETWORK_ERROR_MESSAGE);
        }

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [showError]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      showError(event.message);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof Error) {
        showError(reason.message);
        return;
      }

      if (typeof reason === "string") {
        showError(reason);
        return;
      }

      showError();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    const unsubscribeErrors = subscribeToGlobalErrors(showError);
    const unsubscribeNotifications = subscribeToGlobalNotifications(showNotification);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      unsubscribeErrors();
      unsubscribeNotifications();
    };
  }, [showError, showNotification]);

  return (
    <>
      {notifications.map((notif, index) => (
        <NotificationToast
          key={notif.id}
          onClose={() => removeNotification(notif.id)}
          msg={notif.message}
          sender={notif.variant === "error" ? "System" : (notif as NormalNotification).sender}
          variant={notif.variant}
          stackIndex={index}
        />
      ))}
    </>
  );
}
