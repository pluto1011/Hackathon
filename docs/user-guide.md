# RWA Liquidity Hub: 소개 및 사용자 인터랙션

## 프로젝트 소개
RWA Liquidity Hub는 단일 RWA/Stable 코어 풀로 모든 파생 현물(spot) 마켓을 구동합니다.
가격은 오라클 없이 Virtual Reserve AMM으로 형성되며, 실제 재고(Real Reserves)로 체결량이 제한됩니다.
초과 수요는 Reservation 큐로 전환되어 사용자가 나중에 클레임하거나 취소할 수 있습니다.

핵심 특징:
- 단일 코어 풀 + 무한 파생 풀 구조(유동성 파편화 최소화)
- 실제 재고 캡으로 RWA 무결성 유지
- 예약 큐로 체결 지연을 UX로 흡수

## 사용자 역할
- Trader: 스왑, 예약, 클레임/취소
- LP: 코어 풀 유동성 공급/회수
- Operator/Owner: 어댑터/수수료 설정, 대기열 처리

## 사용자 인터랙션 흐름

### 1) 스왑 전 견적 확인
1. `quote`로 예상 체결량과 캡 여부 확인
2. UI에서 `willReserve` 또는 `rwaOutCap`을 표시해 초과분 예약 가능성을 안내

사용 함수(예시):
- `DerivedSpotPool.quoteExactIn(amountIn)`
- `LiquidityHubRouter.quoteToRwaExactIn(tokenIn, amountIn)`

### 2) 스왑 실행
1. `swapExactIn(..., allowReserve)` 호출
2. 스왑 시작 전에 Router가 예약 대기열을 우선 처리
3. 풀 재고가 충분하면 즉시 체결
4. 재고가 부족하면 초과분은 예약(allowReserve=true) 또는 환불(allowReserve=false)
5. 풀에 유동성이 전혀 없을 때는 allowReserve=true + minOut=0이어야 예약으로 전환됨
6. tokenIn이 stable이 아니라면 사전 설정된 어댑터를 통해 stable로 변환됨

사용 함수(예시):
- `DerivedSpotPool.swapExactIn(amountIn, minOut, to, allowReserve)`
- `LiquidityHubRouter.swapToRwaExactIn(tokenIn, amountIn, minRwaOut, recipient, allowReserve)`

### 3) 예약 확인/클레임/취소
1. 예약 금액은 `reservedStable(user)`로 조회
2. 클레임은 FIFO 대기열 맨 앞 사용자만 가능
3. 클레임 시에도 재고가 부족하면 남은 Stable은 다시 예약됨
4. 취소는 언제든 가능하며 즉시 환불됨

사용 함수(예시):
- `ReservationManager.reservedStable(user)`
- `LiquidityHubRouter.claimReservation(minRwaOut, recipient)`
- `LiquidityHubRouter.cancelReservation()`
- `LiquidityHubRouter.cancelReservationFor(user)`

### 4) 유동성 공급자(LP) 흐름
1. 최초 유동성은 생성자만 가능, RWA totalSupply의 2% 이상 + stable > 0 필요
2. 이후 누구나 유동성 입출금 가능
3. 만기 전에는 생성자 출금 불가
4. 유동성 유입 후 `processQueue`로 예약 대기열 우선 체결

사용 함수(예시):
- `CoreVirtualReservePool.addLiquidity(rwaAmount, stableAmount)`
- `CoreVirtualReservePool.removeLiquidity(rwaAmount, stableAmount, to)`
- `LiquidityHubRouter.processQueue(maxUsers)`

### 5) 만기 이후 흐름
- 만기 이후 스왑/클레임 불가
- `processQueue`는 자동으로 `purge` 로직을 수행해 예약 환불
- 별도로 `purgeExpiredQuotes` 호출 가능

## UI/UX 체크리스트
- ERC20 `approve` 단계 노출
- `quote` 결과에서 `willReserve`/`rwaOutCap`를 강조 표시
- `allowReserve` 토글을 제공하고, false일 때는 초과분 환불/무체결 가능성을 안내
- 예약 상태: `reservedStable`, FIFO 순서, 만기 시간 표시
- 만기 이후 스왑/클레임 비활성화 및 예약 환불 동선 제공

## 참고 문서
- `docs/protocol-guide.md` (프로토콜 상세 + 함수 목록)
- `docs/protocol.md` (규칙 요약 + 프론트 연동)
- `docs/demo.md` (데모 플로우)
- `docs/architecture.md` (핵심 설계)
