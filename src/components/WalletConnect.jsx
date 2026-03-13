import { useState } from "react";
import { truncateAddress } from "../utils/stellar";

export function WalletConnect({ isConnected, publicKey, error, isLoading, onConnect, onDisconnect }) {
  const [showFullAddress, setShowFullAddress] = useState(false);

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <div className="wallet-disconnected">
          <button
            id="connect-wallet-btn"
            className="btn btn-primary btn-glow"
            onClick={onConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-content">
                <span className="spinner"></span>
                Connecting…
              </span>
            ) : (
              <span className="btn-content">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
                Connect Freighter Wallet
              </span>
            )}
          </button>
          {error && (
            <div className="alert alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
              {error.includes("install") && (
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alert-link"
                >
                  Install Freighter →
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-info">
            <div className="wallet-status-dot"></div>
            <div className="wallet-address-wrapper">
              <span className="wallet-label">Connected</span>
              <span
                id="wallet-address-display"
                className="wallet-address"
                title={publicKey}
                onMouseEnter={() => setShowFullAddress(true)}
                onMouseLeave={() => setShowFullAddress(false)}
              >
                {showFullAddress ? publicKey : truncateAddress(publicKey)}
              </span>
            </div>
          </div>
          <button
            id="disconnect-wallet-btn"
            className="btn btn-outline"
            onClick={onDisconnect}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
