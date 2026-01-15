const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

const coreAbi = require("../../shared/abi/CoreVirtualReservePool.json");
const routerAbi = require("../../shared/abi/LiquidityHubRouter.json");
const reservationAbi = require("../../shared/abi/ReservationManager.json");

function loadAddresses() {
  const fromEnv = {
    chainId: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 0,
    core: process.env.CORE_ADDRESS || "",
    router: process.env.ROUTER_ADDRESS || "",
    reservations: process.env.RESERVATION_ADDRESS || "",
    tokens: {
      stable: process.env.STABLE_ADDRESS || "",
      rwa: process.env.RWA_ADDRESS || "",
    },
  };

  if (fromEnv.core && fromEnv.router && fromEnv.reservations) {
    return fromEnv;
  }

  const jsonPath = process.env.ADDRESSES_JSON;
  if (!jsonPath) {
    return fromEnv;
  }

  const baseDir = path.resolve(__dirname, "..");
  const resolved = path.resolve(baseDir, jsonPath);
  if (!fs.existsSync(resolved)) {
    return fromEnv;
  }

  const parsed = JSON.parse(fs.readFileSync(resolved, "utf8"));
  return {
    chainId: parsed.chainId || 0,
    core: parsed.core || fromEnv.core,
    router: parsed.router || fromEnv.router,
    reservations: parsed.reservations || fromEnv.reservations,
    tokens: {
      stable: parsed.tokens?.stable || fromEnv.tokens.stable,
      rwa: parsed.tokens?.rwa || fromEnv.tokens.rwa,
    },
  };
}

function requireAddress(name, value) {
  if (!value || value === "") {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

const addresses = loadAddresses();
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const core = new ethers.Contract(requireAddress("CORE_ADDRESS", addresses.core), coreAbi, provider);
const router = new ethers.Contract(requireAddress("ROUTER_ADDRESS", addresses.router), routerAbi, provider);
const reservations = new ethers.Contract(
  requireAddress("RESERVATION_ADDRESS", addresses.reservations),
  reservationAbi,
  provider
);

const admin = process.env.ADMIN_PK ? new ethers.Wallet(process.env.ADMIN_PK, provider) : null;
const adminCore = admin ? core.connect(admin) : null;
const adminRouter = admin ? router.connect(admin) : null;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/config", (_req, res) => {
  res.json({
    chainId: addresses.chainId,
    core: addresses.core,
    router: addresses.router,
    reservations: addresses.reservations,
    tokens: addresses.tokens,
  });
});

app.get("/pool", async (_req, res) => {
  try {
    const [real, virtuals, effective, feeBps] = await Promise.all([
      core.getRealReserves(),
      core.getVirtualReserves(),
      core.getEffectiveReserves(),
      core.feeBps(),
    ]);

    res.json({
      real: { rwa: real[0].toString(), stable: real[1].toString() },
      virtual: { rwa: virtuals[0].toString(), stable: virtuals[1].toString() },
      effective: { rwa: effective[0].toString(), stable: effective[1].toString() },
      feeBps: feeBps.toString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/quote", async (req, res) => {
  try {
    const tokenIn = req.query.tokenIn;
    const amountIn = req.query.amountIn;
    if (!tokenIn || !amountIn) {
      return res.status(400).json({ error: "tokenIn and amountIn are required" });
    }

    const quote = await router.quoteToRwaExactIn(tokenIn, amountIn);
    res.json({
      rwaOutQuote: quote[0].toString(),
      rwaOutCap: quote[1].toString(),
      stableAmount: quote[2].toString(),
      willReserve: quote[3],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/reservation/:user", async (req, res) => {
  try {
    const user = req.params.user;
    const amount = await reservations.reservedStable(user);
    res.json({ user, reservedStable: amount.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/admin/virtual-reserves", async (req, res) => {
  if (!adminCore) {
    return res.status(401).json({ error: "ADMIN_PK not set" });
  }
  try {
    const { vRwa, vStable } = req.body;
    if (vRwa === undefined || vStable === undefined) {
      return res.status(400).json({ error: "vRwa and vStable are required" });
    }
    const tx = await adminCore.setVirtualReserves(vRwa, vStable);
    res.json({ txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/admin/fee", async (req, res) => {
  if (!adminCore) {
    return res.status(401).json({ error: "ADMIN_PK not set" });
  }
  try {
    const { feeBps } = req.body;
    if (feeBps === undefined) {
      return res.status(400).json({ error: "feeBps is required" });
    }
    const tx = await adminCore.setFeeBps(feeBps);
    res.json({ txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/admin/adapter", async (req, res) => {
  if (!adminRouter) {
    return res.status(401).json({ error: "ADMIN_PK not set" });
  }
  try {
    const { baseToken, adapter, supported } = req.body;
    if (!baseToken || !adapter || supported === undefined) {
      return res.status(400).json({ error: "baseToken, adapter, supported are required" });
    }
    const tx = await adminRouter.setAdapter(baseToken, adapter, supported);
    res.json({ txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
app.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`);
});
