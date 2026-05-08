import { DependencyList, EffectCallback, useEffect } from "react";

/**
 * Custom hook that defers effect execution to the next macrotask.
 * Useful for client-only side effects that should not run on the server.
 * Helps prevent hydration mismatches by ensuring certain logic only runs on the client.
 */
export function useDeferredEffect(effect: EffectCallback, deps?: DependencyList) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      return effect();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, deps);
}
