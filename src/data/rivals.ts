// 아레나 리더보드의 가상 라이벌. 실존 회사를 흉내 내지 않는 가상의 연구소들이다.
export interface Rival {
  id: string;
  emoji: string;
  name: string;
  lab: string;
  /** 시대당 Elo 상승폭 */
  perEra: number;
  /** 시작 Elo */
  base: number;
  /** 등장 시대 */
  from: number;
  quote: string;
}

export const RIVALS: Rival[] = [
  { id: "pegasus", emoji: "🦄", name: "Pegasus", lab: "유니콘 랩스", base: 1020, perEra: 118, from: 0, quote: "우리가 먼저 했어요." },
  { id: "gemstone", emoji: "💎", name: "Gemstone Ultra", lab: "크리스털 리서치", base: 1000, perEra: 116, from: 0, quote: "멀티모달은 우리가 원조죠." },
  { id: "alpaca", emoji: "🦙", name: "Alpaca-405B", lab: "오픈 목장", base: 960, perEra: 112, from: 2, quote: "가중치는 공짜입니다. 받아 가세요." },
  { id: "whale", emoji: "🐋", name: "Whale-R2", lab: "심해 연구소", base: 900, perEra: 121, from: 4, quote: "훨씬 싸게 만들었습니다." },
  { id: "sirocco", emoji: "🌪️", name: "Sirocco Large", lab: "남풍 AI", base: 940, perEra: 110, from: 3, quote: "유럽에서 불어오는 바람." },
  { id: "rocket", emoji: "🚀", name: "Rocket-5", lab: "궤도 지능", base: 920, perEra: 115, from: 5, quote: "더 크게, 더 빨리, 더 시끄럽게." },
  { id: "abacus", emoji: "🧮", name: "Abacus Classic", lab: "레거시 시스템즈", base: 1050, perEra: 80, from: 0, quote: "규칙 기반이 최고였는데…" },
];
