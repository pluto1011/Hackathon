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
- 가격 변동폭: 기본 ±30%, 초기화 전 `setMaxPriceMoveBps`로 조정 가능
- allowReserve=false일 때는 초과분이 환불될 수 있음

## 참여 가이드

### 기관/발행자 (풀 생성자)
1. 준비: RWA ERC20, stable ERC20, 초기 수수료/어댑터 정책 결정
2. 배포: CoreVirtualReservePool, ReservationManager, LiquidityHubRouter 배포 후 router 연결
3. 초기 유동성: `addLiquidity`로 RWA 2% 이상 + stable 예치
4. 유통 채널: baseToken 사용 시 `setAdapter` 등록 및 DerivedSpotPool 생성
5. 운영: 유동성 유입 후 `processQueue`, 만기 후 `purgeExpiredQuotes`
6. 통합: `shared/addresses.json` 갱신 후 프론트/백엔드 연결

참고: 데모 배포 흐름은 `contracts/script/Deploy.s.sol`에 정리되어 있습니다.

### 기관/개인 LP
1. 풀 초기화 이후 누구나 유동성 입출금 가능
2. 출금 시 creator는 만기 전 락에 유의
3. 유동성 추가 후 대기열 처리(`processQueue`) 권장

### 개인 트레이더
1. `quote`로 예상값과 캡 여부 확인
2. `swap` 시 allowReserve 선택
3. 예약 발생 시 `claimReservation` 또는 `cancelReservation` 사용
4. 지원 baseToken 외에는 stable로 직접 스왑

### 운영/킵어
- 대기열 처리: `processQueue(maxUsers)`
- 만기 이후 환불: `purgeExpiredQuotes(maxUsers)`

## 추가 참고
- 상세 함수 목록/역할은 `docs/protocol-guide.md` 참고
- 아키텍처 배경은 `docs/architecture.md` 참고
