# Demo Script

## Setup
1. Deploy contracts with `contracts/script/Deploy.s.sol`.
2. Update `shared/addresses.json`.
3. Start backend and frontend.

## Demo
1. Show the Core Pool reserves and Virtual Reserves.
2. Swap Stable -> RWA and highlight that only real inventory fills.
3. Show reservation created for the overflow.
4. Add more RWA liquidity and claim reservation.
5. Swap via WETH to show derived routing.

## Talking Points
- No price oracle required. Price curve is fully internal.
- Real inventory caps prevent selling non-existent RWA.
- Reservations preserve UX without breaking asset integrity.
- One core pool powers many derived markets.
