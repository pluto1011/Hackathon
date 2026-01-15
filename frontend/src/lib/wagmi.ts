import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle, mantleSepoliaTestnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RWA DEX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [mantle, mantleSepoliaTestnet],
  ssr: true,
});
