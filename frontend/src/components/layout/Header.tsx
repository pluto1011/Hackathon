"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navItems = [
  { name: "Swap", href: "/" },
  { name: "Pool", href: "/pool" },
  // { name: "Analytics", href: "/analytics" }, // TODO: Implement analytics page
  { name: "Reservations", href: "/reservations" },
  { name: "Backend", href: "/backend" },
  { name: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
              <span className="text-xs font-bold text-background">R</span>
            </div>
            <span className="text-base font-semibold tracking-tight">RWA DEX</span>
          </Link>

          <nav className="hidden md:flex items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
                className="flex items-center gap-2"
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="h-8 px-4 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-colors"
                      >
                        Connect
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="h-8 px-4 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <>
                      <button
                        onClick={openChainModal}
                        className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                        {chain.name}
                      </button>
                      <button
                        onClick={openAccountModal}
                        className="h-8 px-4 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                      >
                        {account.displayName}
                      </button>
                    </>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
