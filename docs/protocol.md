# RWA Liquidity Hub Protocol Docs

## 한줄 요약
단일 RWA/Stable 코어 풀을 기준으로 가격을 형성하고, 실재고 캡과 예약 대기열로 체결을 관리합니다.

## 핵심 규칙
- 풀 만기: 배포 시점 + 6시간 (`expiresAt`)
- 만기 이후: `swap` 불가, 예약은 `purge`로 소멸(환불)
- 최초 유동성: 풀 생성자만 가능, RWA totalSupply의 2% 이상 + stable > 0
- 가상 리저브: 초기 가격 비율 유지 + 가격 변동폭이 ±30%를 넘지 않도록 자동 계산
- 예약 대기열: FIFO, 유동성 유입 시 대기열 우선 처리

## 컨트랙트 역할
- CoreVirtualReservePool: 가격곡선 + 실재고 캡 + 유동성 입출금
- LiquidityHubRouter: 스왑 오케스트레이션 + 예약 처리 + 대기열 처리
- ReservationManager: 예약된 stable 보관 + FIFO 큐 관리
- DerivedSpotPool: baseToken별 얇은 래퍼(UX용)
- DerivedSpotPoolFactory: 파생 풀 생성/조회
- SwapAdapter(ISwapAdapter): baseToken -> stable 변환

## 가격/가상 리저브 정책
- 초기 가격 `P0 = realStable / realRwa`
- RWA가 모두 소진될 때 가격이 `P0 * 1.3`을 넘지 않도록 가상 리저브 계산
- 실제 적용:
  - `vRwa = ceil(realRwa / (sqrt(1.3) - 1))`
  - `vStable = ceil(realStable * vRwa / realRwa)` (초기 가격 비율 유지)

## 스왑 & 예약 흐름
1) `quote`로 예상값 확인
2) `swap` 시 실재고 캡 초과분은 예약으로 적립
3) 예약은 FIFO 대기열로 관리
4) 유동성 유입 후 `processQueue`로 대기열 우선 체결
5) 만기 이후 `purgeExpiredQuotes`로 예약 환불
6) 예약 취소 시 즉시 환불되며, 취소된 항목은 대기열에서 자동으로 건너뜀

## 프론트 연동 함수 목록

### 1) 사용자 스왑/예약 (필수)
- `DerivedSpotPool.quoteExactIn(amountIn)` view
- `DerivedSpotPool.swapExactIn(amountIn, minOut, to, allowReserve)` nonpayable
- `LiquidityHubRouter.quoteToRwaExactIn(tokenIn, amountIn)` view
- `LiquidityHubRouter.swapToRwaExactIn(tokenIn, amountIn, minRwaOut, recipient, allowReserve)` nonpayable
- `LiquidityHubRouter.claimReservation(minRwaOut, recipient)` nonpayable  
  - 대기열 맨 앞 사용자만 가능
- `LiquidityHubRouter.cancelReservation()` nonpayable
- `LiquidityHubRouter.cancelReservationFor(user)` nonpayable  
  - 본인 또는 owner만 취소 가능

### 2) 예약 대기열 처리 (운영/킵어 권장)
- `LiquidityHubRouter.processQueue(maxUsers)` nonpayable  
  - 유동성 유입 후 대기열 우선 체결
- `LiquidityHubRouter.purgeExpiredQuotes(maxUsers)` nonpayable  
  - 만기 이후 예약 환불

### 3) LP 기능
- `CoreVirtualReservePool.addLiquidity(rwaAmount, stableAmount)` nonpayable  
  - 최초 유동성은 생성자만 가능 + 2% 규칙 적용
- `CoreVirtualReservePool.removeLiquidity(rwaAmount, stableAmount, to)` nonpayable  
  - 생성자 출금은 만기 이후만 가능

### 4) 모니터링/상태 조회 (UI 표시용)
- Core pool
  - `getRealReserves()`
  - `getVirtualReserves()`
  - `getEffectiveReserves()`
  - `feeBps()`, `vRwa()`, `vStable()`
  - `creator()`, `expiresAt()`, `liquidityInitialized()`
- Router
  - `core()`, `reservations()`, `stable()`, `rwa()`
- ReservationManager
  - `reservedStable(user)`
  - `queueLength()`, `queueHead()`, `queue(index)`
- Factory
  - `getDerivedPool(baseToken)`, `allPoolsLength()`

### 5) 관리자/설정 (Admin UI)
- `LiquidityHubRouter.setAdapter(baseToken, adapter, supported)`
- `CoreVirtualReservePool.setFeeBps(feeBps)`
- `CoreVirtualReservePool.setRouter(router)`
- `ReservationManager.setRouter(router)`
- `ReservationManager.setTtl(ttl)`
- `CoreVirtualReservePool.setVirtualReserves(vRwa, vStable)`  
  - 초기화 전만 가능하며, 초기 유동성 시 자동 계산 값으로 덮어써짐

### 6) Backend API (선택, 프론트에서 호출 시)
- `GET /config` 계약 주소/체인 정보
- `GET /pool` 풀 상태(리얼/가상/유효 리저브)
- `GET /quote?tokenIn=&amountIn=`
- `GET /reservation/:user`
- `GET /health`
- `POST /admin/fee`
- `POST /admin/adapter`
- `POST /admin/virtual-reserves` (초기화 전만 성공)

## 프론트 연결 체크리스트
- 스왑/유동성 추가 전 ERC20 approve 처리
- `allowReserve=false`면 캡 초과 시 바로 환불되므로 UI에서 명확히 안내
- 예약 조회/클레임은 대기열 순서(FIFO) 기준임을 표시
- 예약 취소는 즉시 환불되며, 취소된 유저는 대기열에서 자동 스킵됨
- 만기 이후에는 `swap/claim` 비활성화 + `purge` 버튼 노출
