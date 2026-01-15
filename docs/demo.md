# Demo Script

## Setup
1. Deploy contracts with `contracts/script/Deploy.s.sol`.
2. Update `shared/addresses.json`.
3. Start backend and frontend.
4. Run swaps within 6 hours of deployment (swaps are disabled after expiry).
5. Ensure initial RWA liquidity is at least 2% of totalSupply (stable > 0).

## Demo
1. Show the Core Pool reserves and Virtual Reserves.
2. Swap Stable -> RWA and highlight that only real inventory fills.
3. Show reservation created for the overflow.
4. Add more RWA liquidity and run `processQueue` to fill the reservation.
5. Swap via WETH to show derived routing.
6. (Optional) After expiry, show swap failure, purge queued quotes, and creator withdrawal unlock.

## Talking Points
- No price oracle required. Price curve is fully internal.
- Real inventory caps prevent selling non-existent RWA.
- Reservations preserve UX without breaking asset integrity.
- One core pool powers many derived markets.
- Pool lifetime gates swaps and creator withdrawal.
