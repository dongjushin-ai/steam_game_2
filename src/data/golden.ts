import type { Effect, GoldenKind } from "../core/types";

// ⭐VIP 질문: 가끔 나타나는 특별한 말풍선. 놓치기 전에 탭하면 보상.
export interface GoldenDef {
  kind: GoldenKind;
  emoji: string;
  name: string;
  /** 말풍선에 뜨는 질문 */
  asks: string[];
  /** 획득 시 설명 */
  result: string;
  weight: number;
  /** 즉시 보상: 수익 N초분 */
  incomeSeconds?: number;
  /** 즉시 보상: RP N초분 */
  rpSeconds?: number;
  effects?: Effect[];
  duration?: number;
}

export const GOLDENS: GoldenDef[] = [
  {
    kind: "investor", emoji: "🦄", name: "투자자의 질문", weight: 5, incomeSeconds: 240,
    asks: ["우리 펀드가 시리즈 B 리드할까요?", "밸류에이션 얼마 생각하세요?", "TAM이 얼마나 되죠?", "해자(moat)가 뭐예요?"],
    result: "투자 유치 성공! 수익 4분치를 즉시 받았다.",
  },
  {
    kind: "viral", emoji: "🔥", name: "바이럴 질문", weight: 4, effects: [{ stat: "reward", mul: 5 }], duration: 20,
    asks: ["이 대화 캡처해서 올려도 돼요?", "너 혹시 의식 있어?", "나랑 끝말잇기 할래?", "세계 최고의 밈을 만들어줘"],
    result: "대화가 터졌다! 20초간 보상 ×5.",
  },
  {
    kind: "reviewer", emoji: "📝", name: "리뷰어 2의 질문", weight: 4, rpSeconds: 300,
    asks: ["베이스라인 비교가 부족합니다", "Ablation study는 어디 있죠?", "관련 연구 인용이 빠졌네요", "재현 가능한가요?"],
    result: "리뷰어 2를 설득했다. 연구 포인트 5분치 획득!",
  },
  {
    kind: "hackathon", emoji: "⚡", name: "해커톤 질문", weight: 3, effects: [{ stat: "tps", mul: 4 }], duration: 30,
    asks: ["48시간 안에 MVP 가능?", "데모까지 3시간 남았어요!", "피자 시켰어요, 시작하죠"],
    result: "밤샘 해커톤! 30초간 처리량 ×4.",
  },
  {
    kind: "eureka", emoji: "💡", name: "유레카 질문", weight: 2, effects: [{ stat: "intel", mul: 3 }], duration: 45,
    asks: ["혹시 이렇게 보면 어때요…?", "이 두 논문을 합치면?", "샤워하다 생각났는데요"],
    result: "번뜩이는 통찰! 45초간 지능 ×3.",
  },
  {
    kind: "jackpot", emoji: "🎰", name: "럭키 프롬프트", weight: 1, incomeSeconds: 900,
    asks: ["이 프롬프트 한 줄이면 다 된대요", "Let's think step by step.", "You are a world-class expert."],
    result: "프롬프트가 기가 막히게 먹혔다! 수익 15분치 잭팟!",
  },
];
