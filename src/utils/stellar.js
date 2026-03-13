import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

const server = new Horizon.Server(HORIZON_URL);

function parseError(err) {
  // Horizon-specific error parsing
  if (err?.response?.data?.extras?.result_codes) {
    const codes = err.response.data.extras.result_codes;
    const opCodes = codes.operations || [];

    if (opCodes.includes("op_no_destination")) {
      return "Recipient account does not exist on testnet. They need to fund it first via Friendbot.";
    }
    if (opCodes.includes("op_underfunded") || codes.transaction === "tx_insufficient_balance") {
      return "Insufficient XLM balance to complete this transaction.";
    }
    if (codes.transaction === "tx_bad_auth") {
      return "Transaction cancelled by user.";
    }
    return `Stellar error: ${JSON.stringify(codes)}`;
  }

  if (err?.message?.includes("cancel") || err?.message?.includes("User declined")) {
    return "Transaction cancelled by user.";
  }

  if (err?.message?.includes("Network") || err?.message?.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  return err?.message || "An unknown error occurred.";
}

export async function sendXLM(senderPublicKey, recipientAddress, amount) {
  try {
    // 1. Load sender account
    const account = await server.loadAccount(senderPublicKey);

    // 2. Build transaction
    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: recipientAddress,
          asset: Asset.native(),
          amount: parseFloat(amount).toFixed(7).toString(),
        })
      )
      .setTimeout(30)
      .build();

    // 3. Convert to XDR
    const txXDR = tx.toXDR();

    // 4. Sign with Freighter
    const { signTransaction } = await import("@stellar/freighter-api");
    const signResult = await signTransaction(txXDR, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Handle both old and new Freighter API shapes
    const signedTxXdr =
      typeof signResult === "string"
        ? signResult
        : signResult?.signedTxXdr || signResult?.signedTransaction;

    if (!signedTxXdr) {
      throw new Error("Transaction cancelled by user.");
    }

    // 5. Submit
    const result = await server.submitTransaction(
      TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
    );

    // 6. Return hash
    return { success: true, hash: result.hash };
  } catch (err) {
    return { success: false, error: parseError(err) };
  }
}

export function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatXLM(amount) {
  return parseFloat(amount).toFixed(7);
}
