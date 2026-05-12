"use client";

import { useCallback, useEffect, useState } from "react";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import { subscribeToGlobalErrors } from "@/lib/error-events";

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

export default function GlobalErrorNotifications() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = useCallback((message?: string) => {
    setErrorMessage(normalizeErrorMessage(message));
  }, []);

  useEffect(() => {
    if (!errorMessage) return;

    const timeoutId = setTimeout(() => {
      setErrorMessage(null);
    }, 4500);

    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

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
    const unsubscribe = subscribeToGlobalErrors(showError);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      unsubscribe();
    };
  }, [showError]);

  if (!errorMessage) {
    return null;
  }

  return (
    <NotificationToast
      onClose={() => setErrorMessage(null)}
      msg={errorMessage}
      sender="System"
      variant="error"
    />
  );
}
