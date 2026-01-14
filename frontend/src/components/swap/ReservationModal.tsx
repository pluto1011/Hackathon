"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swapDetails: {
    fromAmount: string;
    fromToken: string;
    toAmount: string;
    toToken: string;
    availableAmount: string;
    reservationAmount: string;
    price: string;
  };
}

export function ReservationModal({
  open,
  onOpenChange,
  swapDetails,
}: ReservationModalProps) {
  const [step, setStep] = useState<"info" | "confirm" | "success">("info");

  const handleConfirm = () => {
    setStep("confirm");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const handleClose = () => {
    setStep("info");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "info" && (
          <>
            <DialogHeader>
              <DialogTitle>Insufficient Pool Liquidity</DialogTitle>
              <DialogDescription>
                The requested amount exceeds available RWA in the pool.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="border-border bg-secondary/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Partial Fill Available</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can receive {swapDetails.availableAmount} {swapDetails.toToken} immediately.
                    The remaining {swapDetails.reservationAmount} {swapDetails.toToken} can be reserved.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Requested Amount</span>
                  <span className="font-medium">{swapDetails.toAmount} {swapDetails.toToken}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Immediate Fill</span>
                  <span className="font-medium">{swapDetails.availableAmount} {swapDetails.toToken}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reservation</span>
                  <span className="font-medium">{swapDetails.reservationAmount} {swapDetails.toToken}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">What is a Reservation?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Not a token or transferable asset</li>
                  <li>- Internal contract state only</li>
                  <li>- Can be cancelled anytime for full refund</li>
                  <li>- Claim when liquidity becomes available</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90" onClick={handleConfirm}>
                  Swap + Reserve
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-lg font-medium">Processing Transaction...</p>
            <p className="text-sm text-muted-foreground">Please confirm in your wallet</p>
          </div>
        )}

        {step === "success" && (
          <>
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-foreground/10 flex items-center justify-center">
                <svg className="h-8 w-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">Transaction Complete</p>
                <p className="text-sm text-muted-foreground mt-1">Your swap and reservation have been processed</p>
              </div>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Received</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{swapDetails.availableAmount} {swapDetails.toToken}</span>
                    <span className="text-xs text-muted-foreground">Filled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reserved</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{swapDetails.reservationAmount} {swapDetails.toToken}</span>
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Close
              </Button>
              <Button variant="outline" className="flex-1">
                View Reservations
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
