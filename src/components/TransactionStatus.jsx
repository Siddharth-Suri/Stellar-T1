import { truncateAddress } from "../utils/stellar";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

const StatusIcon = ({ status }) => {
  if (status === "pending") {
    return <span className="status-icon pending"><span className="spinner spinner-sm"></span></span>;
  }
  if (status === "success") {
    return <span className="status-icon success">✅</span>;
  }
  return <span className="status-icon failed">❌</span>;
};

const StatusBadge = ({ status }) => {
  const labels = { pending: "Pending", success: "Success", failed: "Failed" };
  return (
    <span className={`status-badge status-${status}`}>
      {labels[status] || status}
    </span>
  );
};

export function TransactionStatus({ transactions }) {
  if (!transactions || transactions.length === 0) return null;

  const allDone = transactions.every((tx) => tx.status !== "pending");
  const successCount = transactions.filter((tx) => tx.status === "success").length;
  const failCount = transactions.filter((tx) => tx.status === "failed").length;

  return (
    <div className="tx-status card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h2 className="card-title">Transaction Status</h2>
      </div>

      {allDone && (
        <div className={`tx-summary ${failCount === 0 ? "summary-success" : failCount === transactions.length ? "summary-failed" : "summary-mixed"}`}>
          {failCount === 0 ? (
            <>
              <span className="summary-emoji">🎉</span>
              <span>All {successCount} transaction{successCount !== 1 ? "s" : ""} completed successfully!</span>
            </>
          ) : successCount === 0 ? (
            <>
              <span className="summary-emoji">❌</span>
              <span>All transactions failed. Please try again.</span>
            </>
          ) : (
            <>
              <span className="summary-emoji">⚠️</span>
              <span>{successCount} succeeded, {failCount} failed.</span>
            </>
          )}
        </div>
      )}

      <div className="tx-list">
        {transactions.map((tx, i) => (
          <div key={i} className={`tx-row tx-row-${tx.status}`}>
            <div className="tx-row-left">
              <StatusIcon status={tx.status} />
              <div className="tx-info">
                <div className="tx-recipient">
                  <span className="tx-label">Recipient {i + 1}</span>
                  <span className="tx-address" title={tx.recipient}>
                    {truncateAddress(tx.recipient)}
                  </span>
                </div>
                <div className="tx-amount-row">
                  <span className="tx-amount">{tx.amount} XLM</span>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            </div>

            <div className="tx-row-right">
              {tx.status === "success" && tx.hash && (
                <a
                  id={`tx-hash-link-${i + 1}`}
                  href={`${EXPLORER_BASE}/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-hash-link"
                  title={tx.hash}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  View on Explorer
                </a>
              )}
              {tx.status === "failed" && tx.error && (
                <span className="tx-error" title={tx.error}>
                  {tx.error.length > 60 ? tx.error.slice(0, 60) + "…" : tx.error}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
