import addresses from "../../../shared/addresses.json";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || addresses.chainId || 0),
  core: addresses.core,
  router: addresses.router,
  reservations: addresses.reservations,
  derivedFactory: addresses.derivedFactory,
  derivedPools: addresses.derivedPools || {},
  tokens: {
    stable: addresses.tokens?.stable || "",
    rwa: addresses.tokens?.rwa || "",
    weth: addresses.tokens?.weth || "",
  },
};

export const TOKENS = [
  {
    key: "stable",
    symbol: "USDC",
    address: CONFIG.tokens.stable,
    decimals: 18,
  },
  {
    key: "weth",
    symbol: "WETH",
    address: CONFIG.tokens.weth,
    decimals: 18,
  },
];
