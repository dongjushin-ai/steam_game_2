# 벤치마크: 잘된 방치형 게임과 비교한 평가 (2026-10-18)

질문: 대박 난 키우기·방치형 게임은 어떻게 만들어졌고 우리와 무엇이 다른가. 게이머·평가지 기준으로 우리 게임을 잴 도구가 있나.

## 1. 쓸 만한 평가 도구가 있었나

| 찾은 곳 | 결과 |
|---|---|
| Claude 플러그인 카탈로그 | 게임 평가용은 없음. 가장 가까운 것은 일반 UI 'Design' 플러그인(디자인 비평·접근성)인데, 접근성은 이미 axe로 매번 검사하고 있어 설치하지 않음 |
| GitHub | 게임을 자동 채점하는 저장소는 못 찾음. 학계의 플레이 평가 휴리스틱(PLAY, 54명이 잘된/못된 게임을 평가해 만든 질문 목록)은 논문 형태 |
| Hugging Face | Steam 리뷰 데이터셋 여럿 (1억 건 규모 등). 방치형만 골라 쓰기엔 너무 커서, 같은 출처인 **Steam 공개 리뷰 API**를 직접 씀 |
| 기사·글 | Kongregate 'The Math of Idle Games'(비용 성장·마일스톤·프레스티지 공식), 국내 방치형 흥행 기사(버섯커 키우기) |

그래서 **실제 게이머 리뷰에서 기준을 뽑는 평가 모듈**을 만들었다.
- `tools/review-insights/`: 리뷰 수집·주제 분석·대표 문장 뽑기 (원문은 저장소에 넣지 않음)
- `npm run scorecard`: 그 기준(C1~C11)으로 우리 게임을 봇과 코드로 잰다 (7초)

## 2. 리뷰에서 나온 것 (방치형 18개, 영어 리뷰 4,687개 + 한국어 333개)

대상: Cookie Clicker, Melvor Idle, NGU IDLE, Antimatter Dimensions, Realm Grinder, Clicker Heroes, Leaf Blower Revolution, Idle Slayer, Revolution Idle, Unnamed Space Idle, Gnorp Apologue, **Cell to Singularity**(과학·역사 진화 방치형, 우리와 가장 비슷), Nodebuster, Idle Champions, Increlution, Incremental Epic Hero 2, Idle Wizard, Kittens Game.
게임마다 긍정 300·부정 300(영어)을 따로 받아 비율을 맞췄다.

| 주제 | 긍정 리뷰에서 | 부정 리뷰에서 | 부정 쪽 배수 |
|---|---|---|---|
| 세이브 날아감·버그 | 0.9% | 4.1% | **4.6배** |
| 과금 | 5.0% | 13.8% | 2.7배 |
| 자동화·편의(QoL) 부족 | 2.2% | 4.8% | 2.2배 |
| 리셋(프레스티지) | 2.5% | 5.3% | 2.1배 |
| **진행 벽·느림·지루함** | 9.7% | **20.2%** | 2.1배 (부정 1위) |
| UI·설명 부족 | 3.0% | 5.2% | 1.7배 |
| 숫자 커지는 맛·중독성 | 13.2% | 8.3% | 0.6배 (칭찬 쪽) |
| 유머·이야기 | 4.0% | 2.7% | 0.7배 (칭찬 쪽) |
| 편안함 | 4.2% | 1.9% | 0.5배 (칭찬 쪽) |

대표 문장 (도움이 됨 순):
- 벽: "Beyond Simulation… you're stuck for weeks trying to earn enough to progress." (Cell to Singularity, 482시간)
- 자동화: "So many QoL/Automation elements come way past the point of needing them most." (Revolution Idle, 469시간) / "There is nothing idle about this game, every stage requires constant manual control." (같은 게임)
- 리셋: "incentivising the player to burn themselves out on resetting every 2 minutes." (Cell to Singularity)
- 배움: "one of the most surprisingly educational and memorable games… if you read the descriptions you will find the game is quite educational." (Cell to Singularity)
- 짧은 게임 칭찬: "relatively short incremental game that grew on me", "Short and sweet for an idle/clicker game." (Nodebuster, Gnorp Apologue — 둘 다 '압도적·매우 긍정적')

## 3. 잘된 게임은 어떻게 만들어졌나, 우리와 다른 점

| 잘된 게임의 공통점 | 출처 | 우리 (평가 전) | 지금 |
|---|---|---|---|
| 비용은 지수(×1.07~1.15), 생산은 선형 + 25·50개 마일스톤 ×2 | Math of Idle Games 1부 | ×1.15, 25·50·100…개 ×2 — 같음 | 같음 |
| 프레스티지: 리셋으로 큰 배수, 짧게 반복하는 게 최선이면 안 됨 | 3부, Cell to Singularity 불만 | 출시(체크포인트 1개당 +1%) | +0.5%로 낮춤 (자동 구매로 너무 세짐), 최소 간격 19분 |
| **중반 전에 자동화** (자동 구매·자동 클릭) | Revolution Idle·Egg, Inc. 등, 부정 리뷰 | **없음**. 엔딩까지 건물 약 5,500개를 손으로 | **시대 3부터 자동 구매** |
| 과금 없음 또는 공정 | 부정 2.7배 | 없음 | 없음 |
| 세이브가 안 날아감 | 부정 4.6배 | 백업 슬롯·백그라운드 저장·파일 내보내기·안드로이드 백업 | 같음 |
| 숫자가 계속 커지는 맛, 벽 없이 | 칭찬 주제 | 사람형 봇 한 판에서 시대 7이 34분(벽) | 가장 긴 시대 16분(7판 중앙값) |
| 설명을 읽으면 배우는 재미 | Cell to Singularity 칭찬 | 도감 88·퀴즈 51 | 같음 |
| 한국 흥행작(버섯커 키우기 등): RPG 요소·길드 같은 '하이브리드', 대신 복잡한 UI·과금 부담 지적 | 국내 기사 | 꾸미기·뽑기·랭킹 | 범위 밖 (기능 동결) |

## 4. 평가표 (`npm run scorecard`)

기준 플레이어는 사람형 봇(4초마다 판단, 40%는 아무거나 삼, 자동 구매가 열려도 손으로도 삼). 판마다 차이가 커서 7판 중앙값을 쓰는 항목이 있다.

| | 기준 | 평가 전 | 지금 |
|---|---|---|---|
| C1 | 새로운 일 없이 지나간 가장 긴 시간 | 3분 ✅ | 3분 ✅ |
| C1b | 가장 긴 시대 (7판 중앙값) | (측정 전) 한 판에서 시대 7 34분 | 16분 ✅ |
| C2 | 건물을 손으로 안 사도 끝까지 가나 | ❌ 자동 구매 없음, 후반 분당 62번 구매 | 2h00m (손으로도 사면 1h27m) ✅ |
| C3 | 자동화가 중반 전에 | ❌ 없음 | 시대 3 (10분쯤) ✅ |
| C4 | 출시 최소 간격 | ✅ | 19분 ✅ |
| C5 | 과금 | ✅ 없음 | ✅ |
| C6 | 세이브 안전 | ✅ 4/4 | ✅ |
| C7 | 초보가 안내만으로 시대 3 | ✅ 5분 | ✅ 5분 |
| C8 | 오프라인 보상 | ✅ 8시간 | ✅ |
| C9 | 엔딩 길이 + 엔드게임 | ✅ | 1h33m ✅ |
| C10 | 수입 10배까지 가장 오래 걸린 구간 | ⚠️ 20분 | 14분 ✅ |
| C11 | 배우는 재미·유머 | ✅ | ✅ |

## 5. 그래서 바꾼 것

1. **자동 구매** (C2·C3): 제품 3단계 — 예약 작업 스크립트(시대 3, 1초에 1개) → 자동 조달 파이프라인(시대 6, 2개) → 조달 에이전트(시대 8, 4개).
   지금·직전 시대 건물 중 순이익을 비용 대비 가장 많이 올리는 것을, 가진 돈의 15% 이하일 때만 산다(제품 살 돈이 모이게). 전력이 꽉 차면 전력. 인프라 탭 맨 위에서 켜고 끔. 처음 열리면 소개 창.
   - 옛 시대 건물은 안 산다: 싼 옛 건물을 수백 개 사서 ×2 마일스톤을 쌓는 게 최적이 되면 후반이 무너짐.
2. **밸런스 다시 맞춤**: 자동 구매를 넣자 엔딩이 1h28m → 42~52분으로 빨라졌다. 원인을 재 보니 자동 구매 자체보다 **기존 밸런스가 '1초에 하나만 사는 봇' 기준**이었다 — 꾹 누르기로 버는 만큼 사는 부지런한 사람은 자동 구매가 없어도 49~57분에 끝났다(그동안 '1.5~2시간'이라던 길이가 실제 사람에겐 맞지 않았다는 뜻).
   - 시대 3부터 `calibrate`를 '버는 만큼 쓰는 사람' 기준으로 다시 돌림 (시대 0~2는 사람 플레이테스트로 맞춘 값 유지).
   - 출시 보너스 체크포인트당 1% → 0.5%.
   - 자동 구매 몫 10%·25%·15% 비교 → 15% (느긋한 사람 마지막 시대 55분 벽이 사라지고, 엔딩이 너무 빨라지지 않음).
   - 결과 (사람형 봇 5판 중앙값): 손으로도 사는 사람 1h27m, 자동 구매만 믿는 사람 1h30m, 초보(안내만) 1h46m. 40분 넘는 정체 0.
3. **특이점 너머 시작 한 칸 뒤로**: 엔딩 때 힘이 세져 1~8단계가 10분 만에 지나갔다 → 엔딩 뒤 10분 2단계, 30분 3단계, 1시간 4~6단계, 2시간 7단계 (사람형 봇).

## 6. 한계

- 주제 분류는 키워드 정규식이라 거칠다. 숫자가 튀는 주제는 `quotes.py`로 실제 문장을 읽고 판단했다.
- 리뷰는 PC(Steam) 게이머다. 모바일·한국 게이머는 한국어 리뷰 333개뿐이라 참고만 했다.
- 평가표는 봇으로 잰 대리 지표다. '재미'와 '다시 켜고 싶음'은 친구 비공개 테스트(PRODUCT.md 스프린트 3)로 확인해야 한다.

## 출처
- [The Math of Idle Games, Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i), [Part III (prestige)](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii) — Game Developer
- [Incremental game — Wikipedia](https://en.wikipedia.org/wiki/Incremental_game)
- [PLAY 휴리스틱 (Desurvire 외)](https://usc.academia.edu/HeatherDesurvire), [Playability Assessment for Non-experts Evaluators](https://www.scitepress.org/Papers/2018/66956/66956.pdf)
- [센서타워: 버섯커 키우기 6,400만 달러](https://sensortower.com/ko/blog/Growing-Mushroom-has-earned-64-million-dollars-in-revenue), [머니투데이: 버섯커 키우기 해보니](https://www.mt.co.kr/tech/2024/02/10/2024020813103016706), [디지털데일리: 진화한 방치형 게임](https://www.ddaily.co.kr/page/view/2024011501333739935)
- [Hugging Face: Steam 리뷰 데이터셋 (예: adde023/steam-reviews)](https://hf.co/datasets/adde023/steam-reviews)
- Steam 공개 리뷰 API: `store.steampowered.com/appreviews/{appid}?json=1`
