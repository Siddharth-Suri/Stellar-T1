import { useState, useCallback, useEffect } from "react";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

export function useBalance(publicKey) {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${HORIZON_URL}/accounts/${publicKey}`
      );

      if (response.status === 404) {
        setBalance(null);
        setError("Account not funded. Use Friendbot at laboratory.stellar.org to fund it.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const nativeBalance = data.balances?.find(
        (b) => b.asset_type === "native"
      );

      if (nativeBalance) {
        setBalance(parseFloat(nativeBalance.balance).toFixed(7));
      } else {
        setBalance("0.0000000");
      }
    } catch (err) {
      setError("Could not fetch balance. Please check your connection.");
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, error, isLoading, refetch: fetchBalance };
}
