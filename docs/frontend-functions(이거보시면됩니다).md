# 프론트엔드 함수 설명

이 문서는 `docs/technical-participation.md`의 “프론트에서 사용하는 핵심 함수” 목록을 자세히 설명합니다.

## 가격/조회 (view)

### LiquidityHubRouter.quoteToRwaExactIn(tokenIn, amountIn)

tokenIn을 stable 기준으로 환산한 뒤 RWA 예상 체결량을 계산합니다.  
반환값: `rwaOutQuote`(이론값), `rwaOutCap`(실재고 캡), `stableAmount`(환산된 stable), `willReserve`(캡 초과 여부).

### CoreVirtualReservePool.quoteExactIn(tokenIn, amountIn)

풀 내부 가격곡선 기반으로 수량/가격영향을 계산합니다. tokenIn은 stable 또는 RWA여야 합니다.  
반환값: `amountOut`, `maxFillOut`(실재고 캡), `priceImpactBps`.

### CoreVirtualReservePool.getRealReserves()

풀의 실제 보유 잔액(RWA, stable)을 반환합니다.

### CoreVirtualReservePool.getEffectiveReserves()

실재고 + 가상 리저브의 합산값을 반환합니다.

## 스왑 (post)

### LiquidityHubRouter.swapToRwaExactIn(tokenIn, amountIn, minRwaOut, recipient, allowReserve)

tokenIn(Stable 또는 baseToken)을 RWA로 교환합니다. baseToken이면 어댑터로 stable로 변환 후 스왑합니다.  
`allowReserve=true`면 초과분은 예약으로 전환되고, false면 환불됩니다.  
반환값: `filledRwa`, `reservedStable`.

### LiquidityHubRouter.swapToStableExactIn(amountIn, minStableOut, recipient, maxUsers)

RWA -> stable 스왑입니다. 사용하지 않은 RWA는 환불됩니다.  
`maxUsers > 0`이면 같은 트랜잭션에서 대기열 처리도 수행합니다.  
반환값: `stableOut`, `amountInUsed`.

## 예약/대기열

### LiquidityHubRouter.claimReservation(minRwaOut, recipient)

예약된 stable로 RWA를 체결합니다. 대기열 선두가 아닌 경우 실패합니다.  
일부만 체결되면 남은 stable은 다시 예약됩니다.

### LiquidityHubRouter.cancelReservation()

내 예약을 취소하고 stable을 환불받습니다.

### LiquidityHubRouter.processQueue(maxUsers)

대기열을 최대 `maxUsers`명까지 처리합니다. 만기 이후면 자동으로 purge 로직이 실행됩니다.

### LiquidityHubRouter.purgeExpiredQuotes(maxUsers)

만기 이후 대기열을 취소하고 stable을 환불합니다.

### ReservationManager.reservedStable(user)

특정 사용자의 예약된 stable 총량을 조회합니다.

### ReservationManager.queueHead()

대기열의 현재 헤드 인덱스를 반환합니다.

### ReservationManager.queue(index)

대기열의 해당 인덱스 사용자 주소를 반환합니다. 예약 잔액은 `reservedStable`로 확인합니다.

## 유동성

### CoreVirtualReservePool.addLiquidity(rwaAmount, stableAmount)

풀에 유동성을 추가합니다. 최초 유동성은 `creator` 또는 `liquiditySeeder`만 가능하며,
RWA totalSupply의 2% 이상과 stable > 0이 필요합니다.

### CoreVirtualReservePool.removeLiquidity(rwaAmount, stableAmount, to)

유동성을 출금합니다. creator는 만기 전 출금이 제한됩니다.

### LiquidityHubRouter.addLiquidityAndProcess(rwaAmount, stableAmount, maxUsers)

Router를 통해 유동성을 추가하고, 필요 시 대기열을 처리합니다.

## 풀 생성/관리 (운영자 전용)

### LiquidityHubFactory.createHub(rwa, stable, feeBps, maxPriceMoveBps, vRwa, vStable)

허브(Core/Router/Reservation/DerivedFactory)를 생성합니다. 초기 유동성은 포함되지 않습니다.

### LiquidityHubFactory.createHubAndSeed(params, rwaAmount, stableAmount)

허브 생성과 동시에 초기 유동성을 예치합니다. 사전에 토큰 approve가 필요합니다.

### DerivedSpotPoolFactory.createDerivedPool(baseToken)

baseToken별 파생 풀을 생성합니다. 동일 baseToken에는 하나만 생성됩니다.

### LiquidityHubRouter.setAdapter(baseToken, adapter, supported)

baseToken -> stable 변환 어댑터를 등록/비활성화합니다.

### CoreVirtualReservePool.setMaxPriceMoveBps(maxPriceMoveBps)

초기 유동성 투입 전 가격변동폭 기준을 설정합니다.

### CoreVirtualReservePool.setVirtualReserves(vRwa, vStable)

가상 리저브를 직접 지정합니다. 초기 유동성 이전에만 설정 가능합니다.

### CoreVirtualReservePool.setFeeBps(feeBps)

스왑 수수료를 갱신합니다.

### ReservationManager.setTtl(ttl)

예약 만료 기준값을 저장합니다. 현재 구현에서는 TTL 자동 강제가 없으므로 별도 purge 호출이 필요합니다.

### 주의점: 원래 유니스왑에서는 허브 -> 풀이라고 적어놨는데, 우리의 경우 라우터 -> 허브로 나뉘어져있다. + 파생풀을 만들어서 다른 스왑들하고 integration을 하는 래퍼컨트랙트를 만들었어야 하는데, 못만들었습니다;; 오프체인에서 두번 스왑을 하게끔 만드는 게 최선이라고 생각해요
