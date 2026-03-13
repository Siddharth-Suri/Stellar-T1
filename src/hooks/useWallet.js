import { useState, useCallback } from "react";

let freighterApi = null;

async function getFreighterApi() {
  if (!freighterApi) {
    freighterApi = await import("@stellar/freighter-api");
  }
  return freighterApi;
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const api = await getFreighterApi();

      // Check if Freighter is installed
      const connectedResult = await api.isConnected();
      const isInstalled =
        typeof connectedResult === "object"
          ? connectedResult.isConnected
          : connectedResult;

      if (!isInstalled) {
        setError("Please install the Freighter browser extension.");
        setIsLoading(false);
        return;
      }

      // Request permission — v2 returns the public key string directly on success,
      // or an object with an error field if the user rejects.
      const accessResult = await api.requestAccess();
      if (accessResult && accessResult.error) {
        setError("Connection cancelled by user.");
        setIsLoading(false);
        return;
      }

      // Get public key — v2 exports getPublicKey() (returns plain string)
      const key = await api.getPublicKey();

      if (!key) {
        setError("Could not retrieve wallet address. Please try again.");
        setIsLoading(false);
        return;
      }

      setPublicKey(key);
      setIsConnected(true);
    } catch (err) {
      if (
        err.message &&
        (err.message.includes("cancel") || err.message.includes("reject"))
      ) {
        setError("Connection cancelled by user.");
      } else {
        setError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return { isConnected, publicKey, error, isLoading, connect, disconnect };
}
