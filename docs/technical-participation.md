# 기술 개요 및 참여 가이드

## 이 문서의 범위
이 문서는 프로젝트의 **기술적 설명**과 **기관/개인이 RWA에 참여하는 방법**만 다룹니다.
프로토콜 상세 규칙과 배경(경위)은 별도 문서로 추가하는 것을 전제로 합니다.

## 기술적 설명

### 구성 요소
- CoreVirtualReservePool: RWA/Stable 가격곡선 + 실재고 캡 + 유동성 입출금
- LiquidityHubRouter: 스왑 오케스트레이션 + 예약 처리 + 대기열 처리
- ReservationManager: 초과 수요(Stable) 보관 + FIFO 큐
- DerivedSpotPool/Factory: baseToken별 얇은 래퍼 풀 생성
- SwapAdapter: baseToken -> stable 변환
- (선택) Backend API/Frontend: 조회/시연용 통합 레이어

### 핵심 흐름
1. `quote`로 예상 체결량과 캡 여부 확인
2. `swap` 요청 시 Router가 대기열을 먼저 처리
3. 충분한 재고는 즉시 체결, 부족분은 예약(allowReserve=true) 또는 환불
4. 예약은 FIFO로 관리, 유동성 유입 시 `processQueue`로 우선 처리
5. 만기 이후 스왑 불가, 예약은 `purgeExpiredQuotes`로 환불

### 주요 제약과 안전장치
- 만기: 배포 시점 + 6시간, 만기 이후 스왑/클레임 불가
- 최초 유동성: 생성자만 가능, RWA totalSupply의 2% 이상 + stable > 0 필요
- 생성자 출금: 만기 이전 불가
- 실재고 캡: 실제 재고 이상의 체결 금지
- 가격 변동폭: 기본 ±30%, 초기화 전 `setMaxPriceMoveBps`로 선택적으로 조정 가능
- 오라클/중앙화 마켓메이커 없이 가격 형성 → 시장조작 위험 낮음
- allowReserve=false일 때는 초과분이 환불될 수 있음

## 프론트엔드 개발 가이드

### 연결해야 할 컨트랙트
- LiquidityHubRouter: 스왑/예약/대기열 처리의 단일 엔트리
- CoreVirtualReservePool: 가격/리저브/유동성 상태 조회 및 LP 액션
- ReservationManager: 예약 상태 조회 (reservedStable, queue)
- DerivedSpotPoolFactory/DerivedSpotPool: baseToken 풀 조회/생성 (선택)
- LiquidityHubFactory: 신규 허브 생성(발행자/운영용)

### 프론트에서 사용하는 핵심 함수
상세 설명은 `docs/frontend-functions.md`에 별도로 정리했습니다.
- 가격 조회
  - `LiquidityHubRouter.quoteToRwaExactIn(tokenIn, amountIn)`
  - `CoreVirtualReservePool.quoteExactIn(tokenIn, amountIn)` (RWA -> stable)
  - `CoreVirtualReservePool.getRealReserves()`, `getEffectiveReserves()`
- 스왑
  - `LiquidityHubRouter.swapToRwaExactIn(tokenIn, amountIn, minRwaOut, recipient, allowReserve)`
  - `LiquidityHubRouter.swapToStableExactIn(amountIn, minStableOut, recipient, maxUsers)`
- 예약/대기열
  - `LiquidityHubRouter.claimReservation(minRwaOut, recipient)`
  - `LiquidityHubRouter.cancelReservation()`
  - `LiquidityHubRouter.processQueue(maxUsers)`
  - `LiquidityHubRouter.purgeExpiredQuotes(maxUsers)`
  - `ReservationManager.reservedStable(user)`, `queueHead()`, `queue(index)`
- 유동성
  - `CoreVirtualReservePool.addLiquidity(rwaAmount, stableAmount)`
  - `CoreVirtualReservePool.removeLiquidity(rwaAmount, stableAmount, to)`
  - `LiquidityHubRouter.addLiquidityAndProcess(rwaAmount, stableAmount, maxUsers)`
- 풀 생성/관리 (운영자 전용, owner 권한 필요)
  - `LiquidityHubFactory.createHub(rwa, stable, feeBps, maxPriceMoveBps, vRwa, vStable)`
  - `LiquidityHubFactory.createHubAndSeed(params, rwaAmount, stableAmount)`
  - `DerivedSpotPoolFactory.createDerivedPool(baseToken)`
  - `LiquidityHubRouter.setAdapter(baseToken, adapter, supported)`
  - `CoreVirtualReservePool.setMaxPriceMoveBps(maxPriceMoveBps)`
  - `CoreVirtualReservePool.setVirtualReserves(vRwa, vStable)`
  - `CoreVirtualReservePool.setFeeBps(feeBps)`
  - `ReservationManager.setTtl(ttl)`

운영자 정의: 각 컨트랙트의 `owner` 주소를 의미합니다. `createHub`/`createHubAndSeed` 호출자가 기본 운영자가 되며,
필요 시 `transferOwnership`로 멀티시그/DAO 등 다른 주소로 이전할 수 있습니다.

### 권장 UX 흐름
- 스왑 전: `quoteToRwaExactIn`으로 `rwaOutQuote`, `rwaOutCap`, `willReserve` 표시
- allowReserve=true면 초과분이 예약으로 쌓이고, false면 환불될 수 있음을 안내
- 예약 상태: `reservedStable(user)`가 0이 아니면 “대기 중” 표시
- 클레임: `claimReservation` 호출 (실패 시 아직 대기열 선두가 아닐 수 있음)
- 만기: `core.expiresAt()` 이후엔 스왑/클레임 불가, `purgeExpiredQuotes`만 허용

### 승인(approve) 체크리스트
- `swapToRwaExactIn`: tokenIn을 **Router**에 approve
- `swapToStableExactIn`: RWA를 **Router**에 approve
- `addLiquidityAndProcess`: RWA/Stable을 **Router**에 approve
- `addLiquidity`: RWA/Stable을 **CoreVirtualReservePool**에 approve
- `createHubAndSeed`: RWA/Stable을 **LiquidityHubFactory**에 approve

### DerivedSpotPool 사용 주의
DerivedSpotPool은 Router를 호출하는 얇은 래퍼입니다. Router가 `msg.sender` 기준으로 토큰을 pull하므로,
EOA가 직접 DerivedSpotPool을 호출할 경우 Router가 DerivedSpotPool에서 토큰을 가져가려 합니다.
프론트에서는 **Router 직접 호출을 기본**으로 두고, DerivedSpotPool 사용 시에는 별도 입금/전송 흐름이 필요합니다.

### UI에 꼭 보여줄 상태값
- `core.expiresAt`, `feeBps`, `maxPriceMoveBps`, `vRwa/vStable`
- `liquidityInitialized`, `virtualsInitialized`
- `reservedStable(user)`, `queueHead`, `queueLength`

### 이벤트 구독(선택)
- Core: `LiquidityAdded`, `LiquidityRemoved`, `SwapExecuted`
- Router: `RoutedSwap`, `RoutedSwapToStable`, `ReservationClaimed`, `QueueProcessed`, `QuotesPurged`
- ReservationManager: `ReservationCreated`, `ReservationCancelled`

## 배포 주소 (mantle-sepolia, run-latest 기준)
- 0x1fdCFa6269588eD6DF2D7C14EC7Ed10af2f48c16: MockERC20 (Mock USD, stable)
- 0xaba9c93E1B92A10f720d35691c8ee0e98Dd1B7b8: MockERC20 (Mock RWA)
- 0x7D601D55291c31CfF34F10f1E8fc63719B892c28: MockERC20 (WETH)
- 0x85f074F04189e995000CbD1C133f877E741BD3D5: CoreDeployer
- 0x8e96522b9036a1d6a36A92FB827Dd156e2B9F033: ReservationManagerDeployer
- 0xDA7728119039235f11cE1CDafe75cf16e9D75993: LiquidityHubRouterDeployer
- 0x150297048702fC58eFD776868aecA5D768264AD5: DerivedSpotPoolFactoryDeployer
- 0x2Cfc5903F6Ad43691857C2Cf29F80C5BBf71d0DF: LiquidityHubFactory
- 0xc1D74Eccf3578fAC705D1ba437a89a09D43c3fA3: MockSwapAdapter

참고: 허브(Core/Router/Reservation/DerivedFactory) 주소는 `createHub`/`createHubAndSeed` 반환값 또는 `HubCreated` 이벤트에서 확인합니다.

## 참여 가이드

### 기관/발행자 (풀 생성자)
1. 준비: RWA ERC20, stable ERC20, 초기 수수료/어댑터 정책 결정
2. 배포: CoreVirtualReservePool, ReservationManager, LiquidityHubRouter 배포 후 router 연결
3. 가격 변동폭(선택): `setMaxPriceMoveBps`로 설정하거나 기본값 사용
4. 초기 유동성: `addLiquidity`로 RWA 2% 이상 + stable 예치
5. 유통 채널: baseToken 사용 시 `setAdapter` 등록 및 DerivedSpotPool 생성
6. 운영: 유동성 유입 후 `processQueue`, 만기 후 `purgeExpiredQuotes`
7. 통합: `shared/addresses.json` 갱신 후 프론트/백엔드 연결

운영자 책임: 풀 생성/관리(허브 배포, 파라미터 설정, 어댑터 등록, 초기 유동성 투입, 대기열 관리)는 운영자가 수행해야 합니다.

참고: 데모 배포 흐름은 `contracts/script/Deploy.s.sol`에 정리되어 있습니다.

### 기관/개인 LP
1. 풀 초기화 이후 누구나 유동성 입출금 가능
2. 출금 시 creator는 만기 전 락에 유의
3. 유동성 추가 후 대기열 처리(`processQueue`) 권장
4. 한 트랜잭션에서 처리하려면 `addLiquidityAndProcess` 사용

### 개인 트레이더
1. `quote`로 예상값과 캡 여부 확인
2. `swap` 시 allowReserve 선택
3. 예약 발생 시 `claimReservation` 또는 `cancelReservation` 사용
4. 지원 baseToken 외에는 stable로 직접 스왑
5. RWA -> stable 스왑은 `swapToStableExactIn` 사용 가능

### 운영/킵어
- 대기열 처리: `processQueue(maxUsers)`
- 만기 이후 환불: `purgeExpiredQuotes(maxUsers)`

## 추가 참고
- 상세 함수 목록/역할은 `docs/protocol-guide.md` 참고
- 아키텍처 배경은 `docs/architecture.md` 참고
