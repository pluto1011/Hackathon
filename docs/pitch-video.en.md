# Pitch Video Script & Visual Guide (EN)

## Project Intro Line

"RWA Liquidity Hub is an infrastructure that activates RWA trading using a single RWA/Stable core pool and a Virtual Reserve AMM."

## Goal / Tone

- Goal: Explain the RWA trading problem and show how single core liquidity + virtual reserves + reservations solve it.
- Tone: Clear, explanatory, technically credible.
- Length: 1:30 - 2:00.

## Full Flow (Timeline + Script + Visuals)

### 0:00 - 0:10 Opening (Hook)

**Script**
"This project does not stop at putting RWAs on-chain.  
It shows how we actually increase RWA trading volume."

**Visuals**

- Project title / logo
- One-line vision: "One core pool, many markets"

### 0:10 - 0:30 Problem

**Script**
"Let us start with the problem.  
Traditional AMMs assume deep liquidity and high volatility.  
RWAs have limited supply and prioritize price stability, so the same AMM model creates heavy slippage and price distortion.  
As a result, issuers avoid providing liquidity and traders avoid trading.  
On top of that, many markets legally enforce price limits or circuit bands (China, Korea, Japan, Taiwan; US, EU, Hong Kong, Singapore).  
RWA adoption is hard because those constraints are difficult to enforce on-chain."

**Visuals**

- "RWA vs AMM" slippage comparison chart
- Vicious cycle diagram: low liquidity -> low volume -> lower liquidity

### 0:30 - 0:55 Solution Overview

**Script**
"The answer is, using one pool in swap trades. furthermore, using virtual reserves.
We combine a single Core Pool, Derived Spot Pools, and a Liquidity Hub Router.  
Instead of x*y=k alone, we use (x+vRwa)*(y+vStable)=k so virtual reserves smooth sharp price moves."

**Visuals**

- Architecture diagram (Core Pool -> Derived Pools -> Router)
- Keywords: "Single Core Pool", "Derived Pools", "Router"

### 0:55 - 1:15 Pricing and Safety

**Script**
"Pricing is formed by a Virtual Reserve AMM without an oracle.  
It does not rely on a centralized market maker, so manipulation risk is lower, which does not harm both the philosophy of blockchain, and the RWAs risk.  
As you can see, actual fills are always capped by real inventory.  
If there are more requests in swaping the assets when there are no additional asset, the Overflow demand is converted into a Reservation, which can be canceled or claimed later." If the pool gains the asset by swapping or adding more liquidity, the swap of the quote is executed automatically.

**Visuals**

- "Real vs Virtual Reserves" concept
- Reservation Queue UI/list
- Caption: "Not a token, not transferable, cancellable"

### 1:15 - 1:35 Participation (Institutions / Individuals)

**Script**
"Participation is separated by role.  
Pool creation uses a virtual-reserve curve: (x+vRwa)*(y+vStable)=k.  
Institutions provide initial liquidity and can set a price move limit or keep the default.  
Individuals and LPs can add liquidity later and trade RWA from multiple derived pairs."

**Visuals**

- Institution setting screen: `maxPriceMoveBps` (default +/-30%, configurable)
- LP add/remove liquidity view
- Example derived pairs (RWA/ETH, RWA/USDC)

### 1:35 - 1:55 Demo Flow (Live)

**Script**
"On screen, we first check the quote and cap.  
Then we execute a swap and show the overflow turning into a reservation.  
Next we add liquidity and process the queue so the reservation is filled.  
Finally we claim, and the end-to-end flow is complete."

**Visuals**

- Live UI sequence
  1) Quote (cap indicator)
  2) Swap -> Reservation created
  3) Add Liquidity
  4) Process Queue / Claim

### 1:55 - 2:00 Closing

**Script**
"In short, we are not creating another RWA pool.  
We are expanding DEX trading by centering on a single RWA liquidity base."

**Visuals**

- Vision statement full screen
- GitHub link / team name

## Recording Checklist

- Pre-fill addresses/tokens/amounts to reduce reshoots
- Highlight reservation creation and claim with logs or toasts
- Call out "No Oracle" and "Real Inventory Cap" visually
- Show price limit as "optional, pre-init"

## Bonus: Q&A Points

- Oracle-free pricing -> lower manipulation and price-liability risk
- No centralized market maker -> lower manipulation risk
- Reservation is a wait state, cancelable at any time
- Issuers can design price limits to reduce extreme volatility
