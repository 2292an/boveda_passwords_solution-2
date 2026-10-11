import { useCallback, useEffect, useState } from "react";
import { getCredentials, getStatus } from "../api/vaultApi";
import type { Credential } from "../types/Credential";
import { errorMessage } from "../utils/errorMessage";

export function useCredentials() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const status = await getStatus(signal);
      const items = status.configured ? await getCredentials(signal) : [];
      if (signal?.aborted) return;
      setConfigured(status.configured);
      setCredentials(items);
    } catch (error) {
      if (!signal?.aborted) setError(errorMessage(error));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  return { configured, credentials, loading, error, refresh };
}
