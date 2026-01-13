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

## Reservation Manager
- Holds stable tokens for unfilled demand.
- Users can cancel any time.
- Router can claim by re-swapping reserved stable.

## Router
- Single entry point for swaps
- Handles base token -> stable via adapter
- Caps by real reserves
- Creates reservations for overflow

## Derived Spot Pools
- Thin wrappers around router
- Allows infinite UI pairs without fragmented liquidity
