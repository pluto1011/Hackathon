"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getReservation, getQueue, ReservationResult, QueueResult } from "@/lib/api";
import { formatUnits } from "viem";
import { CONFIG } from "@/lib/config";
import routerAbi from "../../../../shared/abi/LiquidityHubRouter.json";

interface Reservation {
  id: string;
  token: string;
  tokenName: string;
  amount: number;
  stableDeposited: number;
  stableSymbol: string;
  priceAtReservation: number;
  timestamp: string;
  status: "pending" | "claimable" | "cancelled";
  queuePosition?: number;
  estimatedFill?: string;
  isHead?: boolean;
}

export default function ReservationsPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [reservationData, setReservationData] = useState<ReservationResult | null>(null);
  const [queueData, setQueueData] = useState<QueueResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Contract write hooks
  const { writeContract: cancelReservation, data: cancelHash, isPending: isCancelling } = useWriteContract();
  const { writeContract: claimReservation, data: claimHash, isPending: isClaiming } = useWriteContract();

  const { isLoading: isCancelConfirming, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Fetch reservation and queue data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        setReservationData(null);
        setQueueData(null);
        setReservations([]);
        return;
      }

      try {
        setLoading(true);
        const [resData, qData] = await Promise.all([
          getReservation(address),
          getQueue(),
        ]);
        setReservationData(resData);
        setQueueData(qData);

        // Find user's position in queue
        const userQueueInfo = qData.queueUsers.find(
          (u) => u.user.toLowerCase() === address.toLowerCase()
        );
        const isHead = qData.queueUsers.length > 0 &&
          qData.queueUsers[0].user.toLowerCase() === address.toLowerCase();

        // Convert API data to reservation format
        const reservedAmount = Number(formatUnits(BigInt(resData.reservedStable), 18));
        if (reservedAmount > 0) {
          setReservations([
            {
              id: "1",
              token: "RWA",
              tokenName: "RWA Token",
              amount: 0,
              stableDeposited: reservedAmount,
              stableSymbol: "Stable",
              priceAtReservation: 0,
              timestamp: new Date().toISOString(),
              status: isHead ? "claimable" : "pending",
              queuePosition: userQueueInfo?.position || undefined,
              estimatedFill: isHead ? "Ready to claim" : "When liquidity available",
              isHead,
            },
          ]);
        } else {
          setReservations([]);
        }
      } catch (err) {
        console.error("Failed to fetch reservation:", err);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [address, isCancelSuccess, isClaimSuccess]);

  // Close dialogs on success
  useEffect(() => {
    if (isCancelSuccess) {
      setCancelDialogOpen(false);
    }
  }, [isCancelSuccess]);

  useEffect(() => {
    if (isClaimSuccess) {
      setClaimDialogOpen(false);
    }
  }, [isClaimSuccess]);

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const totalValue = reservations.reduce((sum, r) => sum + r.stableDeposited, 0);
  const pendingCount = reservations.filter((r) => r.status === "pending").length;
  const claimableCount = reservations.filter((r) => r.status === "claimable").length;

  const getStatusText = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return <span className="text-xs text-yellow-500">Pending</span>;
      case "claimable":
        return <span className="text-xs text-green-500">Claimable</span>;
      case "cancelled":
        return <span className="text-xs text-muted-foreground/60">Cancelled</span>;
    }
  };

  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  };

  const handleClaimClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setClaimDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!CONFIG.router) return;

    cancelReservation({
      address: CONFIG.router as `0x${string}`,
      abi: routerAbi,
      functionName: "cancelReservation",
      args: [],
    });
  };

  const handleClaimConfirm = () => {
    if (!CONFIG.router || !address) return;

    claimReservation({
      address: CONFIG.router as `0x${string}`,
      abi: routerAbi,
      functionName: "claimReservation",
      args: [BigInt(0), address], // minRwaOut = 0, recipient = user
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-1">Reservations</h1>
            <p className="text-sm text-muted-foreground">
              Manage your RWA token reservations
            </p>
          </div>

          {!isConnected ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to view reservations</p>
            </div>
          ) : (
            <>
              <div className="flex gap-6 mb-6 text-sm">
                <div>
                  <div className="text-muted-foreground mb-0.5">Total Reserved</div>
                  <div className="text-lg font-medium">
                    {loading ? "..." : `${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} Stable`}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">Pending</div>
                  <div className="text-lg font-medium">{loading ? "..." : pendingCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">Claimable</div>
                  <div className="text-lg font-medium">{loading ? "..." : claimableCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">Queue Total</div>
                  <div className="text-lg font-medium">{loading ? "..." : queueData?.pendingCount || 0}</div>
                </div>
              </div>

              {reservationData && Number(reservationData.reservedStable) > 0 && (
                <div className="mb-6 p-4 bg-card rounded-xl">
                  <div className="text-sm text-muted-foreground mb-1">Your Reserved Stable Balance</div>
                  <div className="text-2xl font-medium">
                    {formatUnits(BigInt(reservationData.reservedStable), 18)} Stable
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${reservationData.isQueued ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                      {reservationData.isQueued ? "In Queue" : "Not in Queue"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {reservations[0]?.isHead
                      ? "You are at the front of the queue. You can claim now!"
                      : "This will be converted to RWA when liquidity becomes available."}
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 bg-transparent p-0 h-auto gap-4">
                  <TabsTrigger value="all" className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground">All</TabsTrigger>
                  <TabsTrigger value="pending" className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground">Pending</TabsTrigger>
                  <TabsTrigger value="claimable" className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground">Claimable</TabsTrigger>
                  <TabsTrigger value="cancelled" className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-foreground">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {loading ? (
                    <div className="py-16 text-center">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : filteredReservations.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-muted-foreground">No reservations</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="bg-card rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                {reservation.token.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{reservation.token}</span>
                                  {getStatusText(reservation.status)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {reservation.tokenName}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right text-sm">
                                <div className="text-muted-foreground text-xs">Deposited</div>
                                <div>{reservation.stableDeposited.toLocaleString(undefined, { maximumFractionDigits: 4 })} {reservation.stableSymbol}</div>
                              </div>

                              {reservation.status === "claimable" && (
                                <Button
                                  size="sm"
                                  className="h-8 px-4 bg-foreground text-background hover:bg-foreground/90"
                                  onClick={() => handleClaimClick(reservation)}
                                  disabled={isClaiming || isClaimConfirming}
                                >
                                  {isClaiming || isClaimConfirming ? "Claiming..." : "Claim"}
                                </Button>
                              )}
                              {reservation.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-4 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleCancelClick(reservation)}
                                  disabled={isCancelling || isCancelConfirming}
                                >
                                  {isCancelling || isCancelConfirming ? "Cancelling..." : "Cancel"}
                                </Button>
                              )}
                              {reservation.status === "cancelled" && (
                                <span className="text-xs text-muted-foreground/60">Refunded</span>
                              )}
                            </div>
                          </div>

                          {(reservation.status === "pending" || reservation.status === "claimable") && reservation.estimatedFill && (
                            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{reservation.estimatedFill}</span>
                              {reservation.queuePosition && <span>| Queue #{reservation.queuePosition}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              This will refund your deposited tokens.
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token</span>
                  <span>{selectedReservation.token}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Refund</span>
                  <span>{selectedReservation.stableDeposited.toLocaleString(undefined, { maximumFractionDigits: 4 })} {selectedReservation.stableSymbol}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={isCancelling || isCancelConfirming}
                >
                  Keep
                </Button>
                <Button
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleCancelConfirm}
                  disabled={isCancelling || isCancelConfirming}
                >
                  {isCancelling || isCancelConfirming ? "Processing..." : "Cancel & Refund"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Claim Reservation</DialogTitle>
            <DialogDescription>
              Convert your reserved stable to RWA tokens.
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reserved</span>
                  <span>{selectedReservation.stableDeposited.toLocaleString(undefined, { maximumFractionDigits: 4 })} {selectedReservation.stableSymbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Receive</span>
                  <span>RWA (based on current price)</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                If pool liquidity is insufficient, any remaining stable will stay reserved.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setClaimDialogOpen(false)}
                  disabled={isClaiming || isClaimConfirming}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                  onClick={handleClaimConfirm}
                  disabled={isClaiming || isClaimConfirming}
                >
                  {isClaiming || isClaimConfirming ? "Processing..." : "Claim RWA"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
