# Pitch Slides (No Demo)

Note: Demo is live, so demo slides are intentionally omitted.

## Slide 1 - Title
- Title: RWA Liquidity Hub
- Subtitle: One core pool, many markets
- Visual: Project logo + simple core pool icon

## Slide 2 - Problem
- Traditional AMMs assume deep liquidity and high volatility
- RWAs have limited supply and require price stability
- Result: high slippage, price distortion, low participation
- Many markets legally enforce price limits or circuit bands
- RWA adoption is hard without enforceable on-chain limits
- Visual: price-limit markets list (daily limits vs circuit bands)
  - Daily limits: China (±10% / Risk ±5%, STAR ±20%), Korea (±30%), Japan (yen-band limits), Taiwan (daily limit system)
  - Circuit bands: US (LULD Rule 608), EU (MiFID II), Hong Kong (VCM ±10/15/20% + cooling), Singapore (price band + cooling-off)

## Slide 3 - Key Insight
- Do not create more pools
- Share one core RWA liquidity base across many routes
- Use virtual reserves to dampen sharp price moves
- Curve: (x+vRwa)*(y+vStable)=k
- Visual: Single core pool feeding multiple pairs

## Slide 4 - Architecture
- Core Virtual Reserve Pool
- Derived Spot Pools
- Liquidity Hub Router
- Visual: System diagram (Core -> Router -> Derived Pools)

## Slide 5 - Pricing and Safety
- Oracle-free pricing via Virtual Reserves
- Real inventory cap on fills
- Overflow becomes Reservation (cancel or claim)
- No centralized market maker, lower manipulation risk
- Visual: Real vs Virtual reserves + reservation queue

## Slide 6 - Participation (Institutions)
- Provide initial liquidity
- Pricing uses virtual reserves: (x+vRwa)*(y+vStable)=k
- Optionally set a price move limit (default +/-30%)
- Operate queue processing if needed
- Visual: "maxPriceMoveBps" setting mock

## Slide 7 - Participation (LPs / Traders)
- LPs add or remove liquidity after init
- Traders access RWA through multiple derived pairs
- Reservation provides a safe waitlist instead of failed trades
- Visual: LP panel + derived pair list

## Slide 8 - Impact
- Issuers: stable trading environment
- Traders: predictable pricing, fewer failed trades
- DEX: higher RWA volume and TVL
- Visual: 3-column benefits summary

## Slide 9 - Closing
- "We are not creating another RWA pool."
- "We expand DEX trading with one shared RWA liquidity base."
- Visual: Vision statement full screen + GitHub link
