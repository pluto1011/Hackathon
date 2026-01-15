# Architecture Notes

## Core Virtual Reserve AMM
Effective reserves:
- `E_rwa = realRwa + vRwa`
- `E_stable = realStable + vStable`

Constant product quote:
- `k = E_rwa * E_stable`
- `amountInAfterFee = amountIn * (1 - feeBps)`
- `amountOut = reserveOut - k / (reserveIn + amountInAfterFee)`

Cap:
- `amountOutFilled = min(amountOut, realReserveOut)`

If capped, router sends leftover stable to `ReservationManager`.

Virtual reserves policy:
- Auto-calculated on initial liquidity to cap max price deviation to default ±30% (optionally configurable pre-init).
- `vRwa >= realRwa / (sqrt(1 + maxMove) - 1)`, `vStable`는 초기 가격 유지를 위해 `realStable/realRwa` 비율로 맞춤
- Pricing does not rely on a centralized market maker, reducing manipulation risk.

## Pool Lifetime
- Pool expires at `deployment + 6 hours`.
- Swaps are disabled after expiry.
- Creator must seed the first liquidity with RWA totalSupply 2% + stable > 0.
- After initialization, anyone can add/remove liquidity, but the creator cannot withdraw before expiry.

## Reservation Manager
- Holds stable tokens for unfilled demand.
- Users can cancel any time.
- Router can claim by re-swapping reserved stable.
- Maintains a FIFO queue for reservations (quote waitlist).
- After liquidity is added, router processes the queue first.
- After expiry, router purges the queue and refunds users.

## Router
- Single entry point for swaps
- Handles base token -> stable via adapter
- Caps by real reserves
- Creates reservations for overflow
- Processes reservation queue before new swaps

## Derived Spot Pools
- Thin wrappers around router
- Allows infinite UI pairs without fragmented liquidity
