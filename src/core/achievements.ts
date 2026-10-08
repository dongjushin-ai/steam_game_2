import type { Stats } from "./formulas";
import type { GameState } from "./types";

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  check: (s: GameState, st: Stats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_answer", emoji: "💬", name: "Hello, World!", desc: "첫 질문에 답변하기", check: (s) => s.stats.answered >= 1 },
  { id: "answers_1k", emoji: "🗨️", name: "수다쟁이", desc: "질문 1,000개 답변", check: (s) => s.stats.answered >= 1e3 },
  { id: "answers_1m", emoji: "📣", name: "백만 사용자의 친구", desc: "질문 100만 개 답변", check: (s) => s.stats.answered >= 1e6 },
  { id: "answers_1b", emoji: "🌐", name: "전 인류의 상담사", desc: "질문 10억 개 답변", check: (s) => s.stats.answered >= 1e9 },
  { id: "halluc_100", emoji: "🌀", name: "자신감 넘치는 오답", desc: "할루시네이션 100번", check: (s) => s.stats.hallucinations >= 100 },
  { id: "taps_100", emoji: "👆", name: "인간 피드백", desc: "100번 탭하기", check: (s) => s.stats.taps >= 100 },
  { id: "taps_1000", emoji: "🖐️", name: "RLHF 장인", desc: "1,000번 탭하기", check: (s) => s.stats.taps >= 1000 },
  { id: "turing", emoji: "🎭", name: "이미테이션 게임", desc: "튜링 테스트 통과", check: (s) => s.bossesBeaten.includes(0) },
  { id: "winter", emoji: "❄️", name: "겨울을 견딘 자", desc: "AI 겨울을 맞이하기", check: (s) => s.era >= 3 },
  { id: "chess", emoji: "♟️", name: "체크메이트", desc: "체스 세계 챔피언 격파", check: (s) => s.bossesBeaten.includes(4) },
  { id: "go", emoji: "⚫", name: "신의 한 수", desc: "바둑 9단 격파", check: (s) => s.bossesBeaten.includes(5) },
  { id: "attention", emoji: "⚡", name: "Attention Is All You Need", desc: "트랜스포머 연구", check: (s) => s.upgrades.includes("u_transformer") },
  { id: "chatbot", emoji: "💭", name: "5일 만에 100만", desc: "챗봇 대폭발 시대 도달", check: (s) => s.era >= 7 },
  { id: "thinker", emoji: "🤔", name: "잠깐, 생각 좀 해볼게요", desc: "생각 모드 켜기", check: (s) => s.thinking },
  { id: "mcp_all", emoji: "🔌", name: "모든 것에 연결", desc: "커넥터 6종 전부 구매", check: (s) => ["k_github", "k_slack", "k_drive", "k_notion", "k_figma", "k_db"].every((k) => s.upgrades.includes(k)) },
  { id: "vibe", emoji: "🎸", name: "바이브 코더", desc: "바이브 코딩 모드 구매", check: (s) => s.upgrades.includes("v_vibe") },
  { id: "imo", emoji: "🥇", name: "금메달리스트", desc: "IMO 금메달", check: (s) => s.bossesBeaten.includes(8) },
  { id: "million_ctx", emoji: "🌊", name: "백만 토큰", desc: "컨텍스트 1M 달성", check: (_s, st) => st.ctx >= 1e6 },
  { id: "gw", emoji: "⚡", name: "기가와트 클럽", desc: "전력 공급 1억 ⚡", check: (_s, st) => st.powerCap >= 1e8 },
  { id: "release_1", emoji: "🚀", name: "v2 출시", desc: "새 모델 첫 출시", check: (s) => s.releases >= 1 },
  { id: "release_10", emoji: "🔟", name: "v11", desc: "새 모델 10번 출시", check: (s) => s.releases >= 10 },
  { id: "millionaire", emoji: "💵", name: "유니콘", desc: "누적 10억 크레딧", check: (s) => s.totalEarned >= 1e9 },
  { id: "trillion", emoji: "💎", name: "시총 1조", desc: "누적 1조 크레딧", check: (s) => s.totalEarned >= 1e12 },
  { id: "events_20", emoji: "📰", name: "뉴스 중독", desc: "이벤트 20번 겪기", check: (s) => s.stats.eventsSeen >= 20 },
  { id: "frontier", emoji: "🌌", name: "현재에 도착", desc: "2026 프런티어 시대 도달", check: (s) => s.era >= 9 },
  { id: "ending", emoji: "✨", name: "Q.E.D.", desc: "밀레니엄 난제 해결", check: (s) => s.ended },
];
