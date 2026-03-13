import { useState, useMemo } from "react";
import { sendXLM, formatXLM } from "../utils/stellar";

const MIN_PEOPLE = 2;
const MAX_PEOPLE = 10;

export function BillForm({ senderPublicKey, onTransactionComplete }) {
  const [totalAmount, setTotalAmount] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [addresses, setAddresses] = useState(["", ""]);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState(null);

  const sharePerPerson = useMemo(() => {
    const amount = parseFloat(totalAmount);
    if (!amount || amount <= 0 || numberOfPeople < MIN_PEOPLE) return null;
    return (amount / numberOfPeople).toFixed(7);
  }, [totalAmount, numberOfPeople]);

  const handlePeopleChange = (n) => {
    const count = Math.max(MIN_PEOPLE, Math.min(MAX_PEOPLE, parseInt(n) || MIN_PEOPLE));
    setNumberOfPeople(count);
    setAddresses((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  };

  const handleAddressChange = (index, value) => {
    setAddresses((prev) => {
      const next = [...prev];
      next[index] = value.trim();
      return next;
    });
  };

  const isValid = useMemo(() => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) return false;
    if (addresses.some((a) => !a || a.length < 56)) return false;
    return true;
  }, [totalAmount, addresses]);

  const handleSend = async () => {
    setFormError(null);
    setIsSending(true);

    // Validate addresses
    const invalidAddresses = addresses.filter(
      (a) => !a || a.length !== 56 || !a.startsWith("G")
    );
    if (invalidAddresses.length > 0) {
      setFormError("All recipient addresses must be valid Stellar public keys (56 chars, starting with G).");
      setIsSending(false);
      return;
    }

    const share = sharePerPerson;
    const transactions = addresses.map((addr) => ({
      recipient: addr,
      amount: share,
      status: "pending",
      hash: null,
      error: null,
    }));

    onTransactionComplete(transactions, "init");

    // Send sequentially
    const results = [...transactions];
    for (let i = 0; i < addresses.length; i++) {
      const result = await sendXLM(senderPublicKey, addresses[i], share);
      if (result.success) {
        results[i] = { ...results[i], status: "success", hash: result.hash };
      } else {
        results[i] = { ...results[i], status: "failed", error: result.error };
      }
      onTransactionComplete([...results], "update");
    }

    setIsSending(false);
    onTransactionComplete([...results], "done");
  };

  return (
    <div className="bill-form card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h2 className="card-title">Split the Bill</h2>
      </div>

      <div className="form-group">
        <label htmlFor="total-amount" className="form-label">
          Total Bill Amount
          <span className="label-badge">XLM</span>
        </label>
        <div className="input-wrapper">
          <input
            id="total-amount"
            type="number"
            className="form-input"
            placeholder="0.0000000"
            min="0"
            step="0.0000001"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            disabled={isSending}
          />
          <span className="input-suffix">XLM</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="num-people" className="form-label">
          Number of People
          <span className="label-badge">{MIN_PEOPLE}–{MAX_PEOPLE}</span>
        </label>
        <div className="stepper">
          <button
            id="decrease-people-btn"
            className="stepper-btn"
            onClick={() => handlePeopleChange(numberOfPeople - 1)}
            disabled={numberOfPeople <= MIN_PEOPLE || isSending}
          >
            −
          </button>
          <span id="people-count" className="stepper-value">{numberOfPeople}</span>
          <button
            id="increase-people-btn"
            className="stepper-btn"
            onClick={() => handlePeopleChange(numberOfPeople + 1)}
            disabled={numberOfPeople >= MAX_PEOPLE || isSending}
          >
            +
          </button>
        </div>
      </div>

      {sharePerPerson && (
        <div className="share-preview">
          <div className="share-preview-inner">
            <div className="share-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="share-label">Each person pays</div>
              <div className="share-amount">{sharePerPerson} <span>XLM</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="addresses-section">
        <h3 className="addresses-title">
          Recipient Addresses
          <span className="addresses-hint">Stellar public keys (G...)</span>
        </h3>
        <div className="addresses-list">
          {addresses.map((addr, i) => (
            <div key={i} className="address-row">
              <div className="address-index">
                <span>{i + 1}</span>
              </div>
              <input
                id={`recipient-address-${i + 1}`}
                type="text"
                className={`form-input address-input ${addr && addr.length === 56 && addr.startsWith("G") ? "valid" : addr ? "invalid" : ""}`}
                placeholder={`G${"·".repeat(10)}... (Stellar address)`}
                value={addr}
                maxLength={56}
                onChange={(e) => handleAddressChange(i, e.target.value)}
                disabled={isSending}
              />
              {addr && (
                <div className={`address-check ${addr.length === 56 && addr.startsWith("G") ? "ok" : "bad"}`}>
                  {addr.length === 56 && addr.startsWith("G") ? "✓" : "✗"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {formError && (
        <div className="alert alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {formError}
        </div>
      )}

      <button
        id="send-transactions-btn"
        className="btn btn-primary btn-glow btn-full"
        onClick={handleSend}
        disabled={!isValid || !senderPublicKey || isSending}
      >
        {isSending ? (
          <span className="btn-content">
            <span className="spinner"></span>
            Sending Transactions…
          </span>
        ) : (
          <span className="btn-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Calculate &amp; Send
          </span>
        )}
      </button>

      {!senderPublicKey && (
        <p className="form-hint">Connect your wallet to send transactions</p>
      )}
    </div>
  );
}
