export function BalanceDisplay({ balance, error, isLoading, onRefresh }) {
  return (
    <div className="balance-display card card-glow">
      <div className="balance-header">
        <div className="balance-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <span className="balance-label">XLM Balance</span>
        <button
          id="refresh-balance-btn"
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh balance"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={isLoading ? "spin" : ""}
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3" />
          </svg>
        </button>
      </div>

      <div className="balance-amount">
        {isLoading ? (
          <div className="balance-skeleton">
            <div className="skeleton-bar"></div>
          </div>
        ) : error ? (
          <div className="balance-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            {error.includes("Friendbot") && (
              <a
                href="https://laboratory.stellar.org/#account-creator?network=test"
                target="_blank"
                rel="noopener noreferrer"
                className="balance-link"
              >
                Fund via Friendbot →
              </a>
            )}
          </div>
        ) : balance !== null ? (
          <div className="balance-value">
            <span className="balance-number">{balance}</span>
            <span className="balance-currency">XLM</span>
          </div>
        ) : (
          <span className="balance-placeholder">—</span>
        )}
      </div>
    </div>
  );
}
