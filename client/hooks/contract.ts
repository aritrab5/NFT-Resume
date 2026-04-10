"use client";

import {
  Networks,
  TransactionBuilder,
  Keypair,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  getAddress,
  signTransaction,
  setAllowed,
  isAllowed,
  requestAccess,
} from "@stellar/freighter-api";
import * as contractClient from "contract";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";

// ============================================================
// CONSTANTS — Update these for your contract
// ============================================================

/** Your deployed Soroban contract ID */
export const CONTRACT_ADDRESS =
  "CA3EKKD7D2C4LG7QSMG3MFBFFHPR7UVDJQT7N6AMJDZQEJNGT2SJ3MY7";

/** Network passphrase (testnet by default) */
export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** Soroban RPC URL */
export const RPC_URL = "https://soroban-testnet.stellar.org";

/** Horizon URL */
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

/** Network name for Freighter */
export const NETWORK = "TESTNET";

// ============================================================
// Contract Client Instance
// ============================================================

const client = new contractClient.Client({
  networkPassphrase: NETWORK_PASSPHRASE,
  contractId: CONTRACT_ADDRESS,
  rpcUrl: RPC_URL,
});

// ============================================================
// Wallet Helpers
// ============================================================

export async function checkConnection(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function connectWallet(): Promise<string> {
  const connResult = await isConnected();
  if (!connResult.isConnected) {
    throw new Error("Freighter extension is not installed or not available.");
  }

  const allowedResult = await isAllowed();
  if (!allowedResult.isAllowed) {
    await setAllowed();
    await requestAccess();
  }

  const { address } = await getAddress();
  if (!address) {
    throw new Error("Could not retrieve wallet address from Freighter.");
  }
  return address;
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connResult = await isConnected();
    if (!connResult.isConnected) return null;

    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) return null;

    const { address } = await getAddress();
    return address || null;
  } catch {
    return null;
  }
}

// ============================================================
// Transaction Signing & Submission
// ============================================================

async function signAndSend(tx: any) {
  const { result } = await tx.signAndSend({
    signTransaction: async (xdr: string) => {
      const response = await signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if ('signedTxXdr' in response) {
        return response.signedTxXdr;
      }
      throw new Error("Failed to sign transaction");
    },
  });
  return result;
}

// ============================================================
// NFT Resume — Contract Methods
// ============================================================

/**
 * Mint a new NFT Resume.
 * Calls: mint(user: Address, resume: Resume) -> u64
 * Returns: The ID of the minted resume
 */
export async function mintResume(
  caller: string,
  name: string,
  skills: string,
  experience: string,
  portfolio: string
) {
  const tx = await client.mint({
    user: caller,
    resume: {
      name,
      skills,
      experience,
      portfolio,
    },
  });
  return signAndSend(tx);
}

/**
 * Get Resume Data (read-only).
 * Calls: get_resume(id: u64) -> Option<Resume>
 * Returns: Resume data or null if not found
 */
export async function getResume(id: number) {
  const result = await client.get_resume({ id: BigInt(id) });
  return result.result;
}

/**
 * Get Owner of a Resume (read-only).
 * Calls: owner_of(id: u64) -> Option<Address>
 * Returns: Owner address or null if not found
 */
export async function ownerOf(id: number) {
  const result = await client.owner_of({ id: BigInt(id) });
  return result.result;
}

/**
 * Transfer Ownership of a Resume.
 * Calls: transfer(from: Address, to: Address, id: u64)
 */
export async function transferResume(
  caller: string,
  to: string,
  id: number
) {
  const tx = await client.transfer({
    from: caller,
    to,
    id: BigInt(id),
  });
  return signAndSend(tx);
}