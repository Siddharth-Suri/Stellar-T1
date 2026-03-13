import { useState, useCallback } from "react";
import { useWallet } from "./hooks/useWallet";
import { useBalance } from "./hooks/useBalance";
import { WalletConnect } from "./components/WalletConnect";
import { BalanceDisplay } from "./components/BalanceDisplay";
import { BillForm } from "./components/BillForm";
import { TransactionStatus } from "./components/TransactionStatus";

export default function App() {
  const { isConnected, publicKey, error, isLoading, connect, disconnect } = useWallet();
  const { balance, error: balanceError, isLoading: balanceLoading, refetch } = useBalance(publicKey);
  const [transactions, setTransactions] = useState([]);

  const handleTransactionComplete = useCallback((txs, phase) => {
    setTransactions([...txs]);
    if (phase === "done") {
      // Refresh balance after all txs done
      refetch();
    }
  }, [refetch]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setTransactions([]);
  }, [disconnect]);

  return (
    <div className="app">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="container">
        {/* Header */}
        <header className="app-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">SplitBill</span>
              <span className="logo-subtitle">on Stellar Testnet</span>
            </div>
          </div>
          <WalletConnect
            isConnected={isConnected}
            publicKey={publicKey}
            error={error}
            isLoading={isLoading}
            onConnect={connect}
            onDisconnect={handleDisconnect}
          />
        </header>

        {/* Main content */}
        <main className="main-content">
          {isConnected && (
            <div className="top-row">
              <BalanceDisplay
                balance={balance}
                error={balanceError}
                isLoading={balanceLoading}
                onRefresh={refetch}
              />
              <div className="network-badge">
                <span className="network-dot"></span>
                Stellar Testnet
              </div>
            </div>
          )}

          <div className="content-grid">
            <BillForm
              senderPublicKey={publicKey}
              onTransactionComplete={handleTransactionComplete}
            />

            {transactions.length > 0 && (
              <TransactionStatus transactions={transactions} />
            )}
          </div>

          {!isConnected && (
            <div className="hero-section">
              <div className="hero-graphic">
                <div className="hero-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
                <div className="hero-center-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <h1 className="hero-title">
                Split bills instantly <br />
                <span className="gradient-text">on the blockchain</span>
              </h1>
              <p className="hero-description">
                Connect your Freighter wallet to split any bill into XLM payments
                on the Stellar Testnet. Fast, cheap, and completely decentralized.
              </p>
              <div className="hero-features">
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <span>~5 second settlement</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💸</span>
                  <span>0.00001 XLM per tx</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔒</span>
                  <span>Non-custodial signing</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <span>Built on</span>
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
            Stellar Testnet
          </a>
          <span>·</span>
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer">
            Explorer
          </a>
          <span>·</span>
          <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener noreferrer">
            Friendbot
          </a>
        </footer>
      </div>
    </div>
  );
}
