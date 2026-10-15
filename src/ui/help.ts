// 게임 방법 + 용어 사전. 헤더의 "?"(창)와 도감 › 도움말(탭) 두 곳에서 같은 내용을 보여 준다.
import { L } from "../i18n/lang";
import { h } from "./dom";
import { ic, type IconName } from "./icons";
import { showModal } from "./modals";

const STEPS: { icon: IconName; title: () => string; text: () => string }[] = [
  { icon: "rocket", title: () => L("목표", "Goal"), text: () => L("질문에 답해 돈을 벌고, AI를 키워 시대마다 보스(벤치마크)를 깨세요. 11번째 시대 끝에 엔딩이 있어요.", "Answer questions to earn money, grow your AI and beat each era's boss (benchmark). The ending waits at the end of era 11.") },
  { icon: "chat", title: () => L("돈 버는 법", "Earning"), text: () => L("왼쪽에서 걸어오는 질문 몬스터를 AI가 알아서 처리해요. 화면을 톡톡 누르면 더 빨리 벌어요(연타하면 콤보).", "Your AI handles the question monsters walking in from the left. Tap the screen to earn faster (keep tapping for combos).") },
  { icon: "chip", title: () => L("무엇을 살까", "What to buy"), text: () => L("인프라: 답변 속도와 전력. 서비스: 질문을 보내 줄 유저. 연구: 지능과 기억력. '추천' 표시가 붙은 걸 사면 대개 맞아요. 버튼을 꾹 누르면 연속 구매.", "Infra: answer speed and power. Service: users who send questions. Research: IQ and memory. The 'Best' badge is usually right. Hold a buy button to keep buying.") },
  { icon: "trophy", title: () => L("보스", "Bosses"), text: () => L("장면 아래 막대가 35%를 넘으면 도전 가능, 초록(준비 완료)이면 거의 이겨요. 싸우는 30초 동안 연타하세요.", "Past 35% on the bar under the scene you can challenge; green (ready) means you'll almost surely win. Tap hard during the 30 seconds.") },
  { icon: "disk", title: () => L("막혔을 때", "When stuck"), text: () => L("벤치마크 탭의 '새 모델 출시'. 돈·연구 점수·모델은 처음부터지만 체크포인트로 영구히 빨라져요.", "'Release a new model' in Bench. Money, research score and model reset, but checkpoints make you permanently faster.") },
];

const TERMS: [() => string, () => string][] = [
  [() => L("크레딧", "Credits"), () => L("게임 돈. 건물과 상품을 사요.", "Game money. Buys buildings and products.")],
  [() => L("연구 점수 (RP)", "Research score (RP)"), () => L("연구팀이 모아요. 연구 탭의 기술을 배워요.", "Your research team earns it. Spend it on tech in Research.")],
  [() => L("답변 속도 (처리량)", "Answer speed (throughput)"), () => L("1초에 처리하는 글자 양(토큰). 컴퓨터를 사면 빨라져요. 보스전 점수도 이걸로 쌓여요.", "How many tokens you process per second. Buy computers to raise it; it also drives boss score.")],
  [() => L("전력", "Power"), () => L("컴퓨터가 쓰는 전기. 모자라면 답변 속도가 떨어져요. 인프라의 '전력'에서 늘려요.", "Electricity your computers use. Run short and answer speed drops. Add more under Infra › Power.")],
  [() => L("지능", "IQ"), () => L("AI의 똑똑함. 높을수록 어려운(비싼) 질문을 받아요. 보스 도전 조건이기도 해요.", "How smart your AI is. Higher IQ means harder, pricier questions. Also a boss requirement.")],
  [() => L("기억력 (컨텍스트)", "Memory (context)"), () => L("한 번에 읽을 수 있는 글 길이. 긴 질문(코딩·리서치)을 받으려면 필요해요.", "How much text the AI can read at once. Needed for long questions like coding and research.")],
  [() => L("헛소리 (할루시네이션)", "Nonsense (hallucination)"), () => L("자신 있게 틀린 답. 그만큼 돈을 못 받아요. 연구와 생각 모드로 줄여요.", "Confidently wrong answers that earn nothing. Cut it with research and Thinking Mode.")],
  [() => L("답변 가격", "Answer price"), () => L("답 하나에 드는 비용. 낮을수록 남는 돈이 많아요.", "What each answer costs you. Lower means more profit.")],
  [() => L("체크포인트", "Checkpoints"), () => L("새 모델을 출시하면 받는 영구 보너스. 보상·연구 +1%씩.", "Permanent bonus from releasing a new model: +1% rewards and research each.")],
  [() => L("시드 · 조각", "Seeds · Shards"), () => L("시드: 뽑기에 쓰는 표(플레이로만 얻음). 조각: 겹친 아이템이 바뀐 것, 원하는 걸 바로 교환.", "Seeds: gacha tickets earned only by playing. Shards: from duplicates, trade them for what you want.")],
];

export function helpContent(): HTMLElement[] {
  return [
    h("div", { class: "help-steps" }, ...STEPS.map((x) => h("div", { class: "help-step" }, h("span", { class: "hi" }, ic(x.icon)), h("div", null, h("b", null, x.title()), h("p", null, x.text()))))),
    h("h3", { class: "help-sub" }, L("용어 사전", "Glossary")),
    h("dl", { class: "glossary" }, ...TERMS.flatMap(([t, d]) => [h("dt", null, t()), h("dd", null, d())])),
  ];
}

export function openHelp(): void {
  showModal({ title: L("게임 방법", "How to play"), body: helpContent(), buttons: [{ label: L("닫기", "Close") }], dismissable: true });
}
