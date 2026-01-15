const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// Types
export interface PoolState {
  real: { rwa: string; stable: string };
  virtual: { rwa: string; stable: string };
  effective: { rwa: string; stable: string };
  feeBps: string;
}

export interface QuoteResult {
  rwaOutQuote: string;
  rwaOutCap: string;
  stableAmount: string;
  willReserve: boolean;
}

export interface ReservationResult {
  user: string;
  reservedStable: string;
}

export interface ConfigResult {
  chainId: number;
  core: string;
  router: string;
  reservations: string;
  tokens: {
    stable: string;
    rwa: string;
  };
}

export interface TxResult {
  txHash: string;
}

// API Functions

export async function getHealth(): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function getConfig(): Promise<ConfigResult> {
  const res = await fetch(`${API_URL}/config`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function getPool(): Promise<PoolState> {
  const res = await fetch(`${API_URL}/pool`);
  if (!res.ok) throw new Error("Failed to fetch pool state");
  return res.json();
}

export async function getQuote(tokenIn: string, amountIn: string): Promise<QuoteResult> {
  const params = new URLSearchParams({ tokenIn, amountIn });
  const res = await fetch(`${API_URL}/quote?${params}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch quote");
  }
  return res.json();
}

export async function getReservation(user: string): Promise<ReservationResult> {
  const res = await fetch(`${API_URL}/reservation/${user}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch reservation");
  }
  return res.json();
}

// Admin functions
export async function setVirtualReserves(vRwa: string, vStable: string): Promise<TxResult> {
  const res = await fetch(`${API_URL}/admin/virtual-reserves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vRwa, vStable }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to set virtual reserves");
  }
  return res.json();
}

export async function setFee(feeBps: number): Promise<TxResult> {
  const res = await fetch(`${API_URL}/admin/fee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feeBps }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to set fee");
  }
  return res.json();
}

export async function setAdapter(
  baseToken: string,
  adapter: string,
  supported: boolean
): Promise<TxResult> {
  const res = await fetch(`${API_URL}/admin/adapter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseToken, adapter, supported }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to set adapter");
  }
  return res.json();
}
