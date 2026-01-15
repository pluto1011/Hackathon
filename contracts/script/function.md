프론트에서 직접 호출해야 할 on‑chain 함수들을 목적별로 정리했어. (사용자/운영/조회 기준)

User Tx

LiquidityHubRouter.swapToRwaExactIn(tokenIn, amountIn, minRwaOut, recipient, allowReserve) -> (filledRwa, reservedStable)
DerivedSpotPool.swapExactIn(amountIn, minOut, to, allowReserve) -> (filledRwa, reservedStable)
LiquidityHubRouter.swapToStableExactIn(amountIn, minStableOut, recipient, maxUsers) -> (stableOut, amountInUsed)
LiquidityHubRouter.claimReservation(minRwaOut, recipient) -> filledRwa
LiquidityHubRouter.cancelReservation() / LiquidityHubRouter.cancelReservationFor(user)
Liquidity & Hub Creation

CoreVirtualReservePool.addLiquidity(rwaAmount, stableAmount)
CoreVirtualReservePool.removeLiquidity(rwaAmount, stableAmount, to)
LiquidityHubRouter.addLiquidityAndProcess(rwaAmount, stableAmount, maxUsers) -> (processedUsers, processedStable)
LiquidityHubFactory.createHubAndSeed(params, rwaAmount, stableAmount) -> (core, reservations, router, derivedFactory)
LiquidityHubFactory.createHub(rwa, stable, feeBps, maxPriceMoveBps, vRwa, vStable) -> (...)
Quotes & Reserves (View)

LiquidityHubRouter.quoteToRwaExactIn(tokenIn, amountIn) -> (rwaOutQuote, rwaOutCap, stableAmount, willReserve)
DerivedSpotPool.quoteExactIn(amountIn) -> (rwaOutQuote, rwaOutCap, stableAmount, willReserve)
CoreVirtualReservePool.quoteExactIn(tokenIn, amountIn) -> (amountOut, maxFillOut, priceImpactBps)
CoreVirtualReservePool.getRealReserves() -> (realRwa, realStable)
CoreVirtualReservePool.getEffectiveReserves() -> (eRwa, eStable) / getVirtualReserves() -> (vRwa, vStable)
Derived Pools (View/Create)

DerivedSpotPoolFactory.createDerivedPool(baseToken) -> pool
DerivedSpotPoolFactory.getDerivedPool(baseToken) -> pool
DerivedSpotPoolFactory.allPoolsLength() -> uint256
DerivedSpotPoolFactory.allPools(index) -> pool
DerivedSpotPool.baseToken() / DerivedSpotPool.router() / DerivedSpotPool.initialized()
Reservations (View)

ReservationManager.reservedStable(user) -> uint256
ReservationManager.createdAt(user) -> uint64
ReservationManager.queueLength() -> uint256
ReservationManager.queueHead() -> uint256 / ReservationManager.queue(index) -> address
ReservationManager.ttl() -> uint64 / ReservationManager.queued(user) -> bool
Admin / Keeper

LiquidityHubRouter.setAdapter(baseToken, adapter, supported) (onlyOwner)
LiquidityHubRouter.processQueue(maxUsers) -> (processedUsers, processedStable) / purgeExpiredQuotes(maxUsers) -> (purgedUsers, refundedStable)
CoreVirtualReservePool.setVirtualReserves(vRwa, vStable) (onlyOwner)
CoreVirtualReservePool.setMaxPriceMoveBps(maxPriceMoveBps) / setFeeBps(feeBps) / setRouter(router) (onlyOwner)
ReservationManager.setRouter(router) / setTtl(ttl) / DerivedSpotPoolFactory.setRouter(router) / setImplementation(implementation) (onlyOwner)
메모:

스왑/유동성 추가 전엔 해당 토큰의 approve가 필요해.
CoreVirtualReservePool.swapExactIn 및 ReservationManager.createReservation/releaseStable/nextReservation는 라우터 전용이므로 프론트에서 직접 호출하지 않아.
