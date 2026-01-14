"use client";

import { Header } from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <h1 className="text-2xl font-semibold mb-3">About RWA DEX</h1>
            <p className="text-muted-foreground">
              RWA 거래량을 활성화하고, 탈중앙 DEX 생태계를 확장하는 새로운 구조
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-lg font-medium mb-4">Problem</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  현재 RWA는 온체인에 존재하더라도 실제 거래량은 매우 제한적입니다.
                  이는 RWA에 대한 수요가 없어서가 아니라, RWA가 기존 DEX 구조에 맞지 않기 때문입니다.
                </p>
                <p>
                  기존 AMM은 충분한 유동성과 가격 변동성을 전제로 설계되었지만,
                  RWA는 실물 자산 기반으로 공급량이 제한되어 있고 가격 안정성이 핵심입니다.
                  동일한 구조를 적용하면 심각한 슬리피지와 가격 왜곡이 발생합니다.
                </p>
                <p>
                  RWA 발행자는 풀 유동성 제공을 꺼리게 되고, 사용자는 거래를 회피하며,
                  결과적으로 RWA DEX는 활성화되지 못하는 악순환에 빠집니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Core Idea</h2>
              <div className="bg-card rounded-xl p-4 mb-4">
                <p className="text-sm">
                  RWA 거래를 활성화하려면, 풀을 많이 만드는 것이 아니라
                  하나의 RWA 유동성을 최대한 많은 거래 경로에서 안전하게 공유하게 만들어야 합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-1">1. Core Liquidity Pool</h3>
                  <p className="text-xs text-muted-foreground">
                    RWA-Stable 페어로 구성된 단일 실물 유동성 풀. 실제 RWA 재고가 보관되는 유일한 풀.
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-1">2. Derived Spot Pools</h3>
                  <p className="text-xs text-muted-foreground">
                    가상 유동성을 활용한 파생 풀. 다양한 페어(RWA/ETH 등)에서 거래 가능.
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-1">3. Liquidity Hub Router</h3>
                  <p className="text-xs text-muted-foreground">
                    모든 체결과 한도 관리를 담당. Core Pool 기준 가격 및 체결 가능 수량 계산.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Virtual Reserve AMM</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  외부 오라클이나 NAV 입력에 의존하지 않습니다.
                  풀 내부에서 관리되는 Virtual Reserve(가상 준비금)를 통해 가격을 자동으로 산출합니다.
                </p>
                <p>
                  Virtual Reserve는 가격을 고정하는 장치가 아닙니다.
                  유동성이 얕은 상황에서도 가격 곡선을 완만하게 만들어
                  극단적인 슬리피지와 가격 급변을 완화하는 역할입니다.
                </p>
                <p>
                  중요한 점은 가격 계산과 실제 체결의 분리입니다.
                  가격은 가상 준비금을 포함한 비율로 산출되지만,
                  실제 체결은 언제나 실물 재고(realRWA) 한도 내에서만 이루어집니다.
                </p>
              </div>

              <div className="mt-4 bg-secondary rounded-xl p-4">
                <div className="text-xs font-mono text-muted-foreground space-y-1">
                  <div>effectiveReserve = realReserve + virtualReserve</div>
                  <div>price = stableReserve / effectiveReserve</div>
                  <div>maxSwap = min(requestedAmount, realReserve)</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Reservation Queue</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  실물 재고를 초과하는 스왑 요청은 즉시 체결되지 않고 Reservation 상태로 전환됩니다.
                  시스템은 없는 자산을 판매하지 않으면서도, 사용자에게 합리적인 대기 옵션을 제공합니다.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-muted-foreground mb-2">Reservation은:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>- 자산 아님</li>
                    <li>- 토큰 아님</li>
                    <li>- 컨트랙트 내부 상태</li>
                    <li>- 양도 불가</li>
                    <li>- 언제든 취소 가능</li>
                  </ul>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-muted-foreground mb-2">향후 가능성:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>- KYC된 계정에게 양도</li>
                    <li>- 신주인수권부사채 유사 기능</li>
                    <li>- 파생상품/선물거래</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">User Flow</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="w-5">1.</span>
                  <span>Derived Spot Pool(RWA/ETH 등)에서 스왑 요청</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-5">2.</span>
                  <span>Router가 Core Pool 기준 가격 및 체결 가능 수량 계산</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-5">3.</span>
                  <span>즉시 체결 가능한 수량만 실물 기준으로 체결</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-5">4.</span>
                  <span>초과분은 Reservation으로 전환</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-5">5.</span>
                  <span>즉시 체결된 RWA 수령 / Reservation 취소(환불) / 유동성 유입 후 claim</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Use Cases</h2>

              <div className="bg-card rounded-xl p-4 mb-4 border border-border">
                <h3 className="text-sm font-medium mb-2">유동성 공급 기관</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>- Reserve 조절로 상한가/하한가 구현 가능</li>
                  <li>- 서버 개발 없이 RWA 거래소 운영</li>
                  <li>- 아비투스 없는 개인이 직접 MM 참여 가능</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <h3 className="text-xs font-medium mb-2">RWA 발행자</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- 가격 왜곡 없는 거래 환경</li>
                    <li>- 단일 풀 구조</li>
                    <li>- 풀 예치 유인 제공</li>
                  </ul>
                </div>

                <div className="bg-secondary/50 rounded-xl p-3">
                  <h3 className="text-xs font-medium mb-2">트레이더</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- 다양한 페어 접근</li>
                    <li>- 슬리피지 없는 UX</li>
                    <li>- Reservation 대안</li>
                  </ul>
                </div>

                <div className="bg-secondary/50 rounded-xl p-3">
                  <h3 className="text-xs font-medium mb-2">DEX 생태계</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- RWA 거래량 증가</li>
                    <li>- 풀 TVL 증가</li>
                    <li>- 스팟 거래 활성화</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Why No Oracle?</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  RWA의 특성과 탈중앙 거래소의 철학이 오라클 기반 가격 구조와 근본적으로 충돌하기 때문입니다.
                </p>
                <p>
                  NAV/오라클 가격은 누군가에 의해 계산되고 업데이트되어야 합니다.
                  "가격을 누가 정의하는가"라는 질문은 RWA 환경에서 책임, 신뢰, 규제 문제로 직결됩니다.
                  가격 업데이트 지연이나 산정 방식에 대한 불투명성은 차익거래, 가격 왜곡, 발행자에 대한 신뢰 훼손으로 이어질 수 있습니다.
                </p>
                <p>
                  RWA는 실물 자산 기반이므로 가격이 단일하고 명확하게 존재한다고 가정하기 어렵습니다.
                  실물 시장의 유동성, 금리 환경, 거래 가능성 등 다양한 요인이 복합적으로 작용합니다.
                </p>
                <p>
                  본 프로젝트는 가격을 외부에서 주입하는 대신,
                  가격 형성 자체를 시장 메커니즘에 맡기는 구조를 선택합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Price Disclaimer</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  본 프로젝트는 이 가격이 RWA의 공정 가치이거나 법적/회계적 기준 가격이라고 주장하지 않습니다.
                  이 가격은 단지 탈중앙 거래소 상에서 형성된 교환 비율일 뿐입니다.
                </p>
                <p>
                  이러한 입장은 가격에 대한 책임을 특정 주체에게 귀속시키지 않고,
                  가격 형성의 결과를 시장 참여자의 집합적 행동으로 환원시킵니다.
                  이는 탈중앙 거래소의 본질에 부합할 뿐만 아니라,
                  RWA 환경에서 발생할 수 있는 가격 책임 및 조작 논란을 구조적으로 차단합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Roadmap</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>- Oracle/NAV 자동화 고도화</div>
                <div>- Uniswap v3/v4 외부 유동성 결합</div>
                <div>- Router 기반 다중 RWA 확장</div>
                <div>- 기관/DAO 전용 모드</div>
                <div>- 자동 Reservation 해소 로직</div>
              </div>
            </section>

            <section className="border-t border-border pt-8">
              <p className="text-sm">
                우리는 RWA를 위한 또 하나의 풀을 만들지 않습니다.
                하나의 RWA 유동성을 중심으로, 탈중앙 DEX 전체의 거래를 확장합니다.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
