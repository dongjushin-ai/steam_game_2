import { arenaRank } from "./arena";
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
  { id: "golden_1", emoji: "⭐", name: "VIP 손님", desc: "⭐VIP 질문 처음 잡기", check: (s) => s.stats.goldens >= 1 },
  { id: "golden_25", emoji: "🌟", name: "VIP 라운지", desc: "⭐VIP 질문 25개 잡기", check: (s) => s.stats.goldens >= 25 },
  { id: "quiz_1", emoji: "🤓", name: "AI 덕후", desc: "AI 역사 퀴즈 첫 정답", check: (s) => s.stats.quizCorrect >= 1 },
  { id: "quiz_10", emoji: "🎓", name: "AI 역사학자", desc: "퀴즈 10개 정답", check: (s) => s.stats.quizCorrect >= 10 },
  { id: "quiz_30", emoji: "📚", name: "걸어 다니는 위키", desc: "퀴즈 30개 정답", check: (s) => s.stats.quizCorrect >= 30 },
  { id: "combo_25", emoji: "🥁", name: "연타의 신", desc: "25콤보", check: (s) => s.stats.maxCombo >= 25 },
  { id: "combo_50", emoji: "🔥", name: "인간 오토클리커", desc: "50콤보 (최대 보너스)", check: (s) => s.stats.maxCombo >= 50 },
  { id: "quests_5", emoji: "📋", name: "성실한 인턴", desc: "임무 5개 완료", check: (s) => s.stats.questsDone >= 5 },
  { id: "quests_50", emoji: "🗂️", name: "에이스 직원", desc: "임무 50개 완료", check: (s) => s.stats.questsDone >= 50 },
  { id: "milestone_100", emoji: "💯", name: "백 대 돌파", desc: "한 건물을 100개 보유", check: (s) => Object.values(s.buildings).some((n) => n >= 100) },
  { id: "buildings_1000", emoji: "🏗️", name: "물량전", desc: "건물 합계 1,000개", check: (s) => Object.values(s.buildings).reduce((a, b) => a + b, 0) >= 1000 },
  { id: "auto", emoji: "🤖", name: "자동화의 시작", desc: "자동 답변 상품 구매", check: (_s, st) => st.autoTap > 0 },
  { id: "think_600", emoji: "🧘", name: "깊은 생각", desc: "생각 모드 누적 10분", check: (s) => s.stats.thinkSeconds >= 600 },
  { id: "hall_1", emoji: "✅", name: "팩트 체커", desc: "할루시네이션 1% 이하", check: (_s, st) => st.hall <= 0.01 },
  { id: "deficit", emoji: "📉", name: "적자 경영", desc: "순이익이 마이너스가 되어보기", check: (_s, st) => st.net < 0 },
  { id: "tier_11", emoji: "♾️", name: "마지막 질문", desc: "밀레니엄 난제 질문 받기", check: (_s, st) => st.tier.id >= 11 },
  { id: "ctx_10m", emoji: "🌌", name: "평생 기억", desc: "컨텍스트 10M 달성", check: (_s, st) => st.ctx >= 1e7 },
  { id: "speedrun", emoji: "⏱️", name: "스피드런", desc: "플레이 1시간 안에 딥러닝 혁명 도달", check: (s) => s.era >= 5 && s.stats.playSeconds <= 3600 },
  { id: "arena_1", emoji: "🏟️", name: "아레나 1위", desc: "챗봇 아레나 리더보드 1위", check: (s, st) => arenaRank(s, st) === 1 },
  { id: "dyson", emoji: "☀️", name: "카르다쇼프 2단계", desc: "다이슨 스웜 건설", check: (s) => (s.buildings.p_dyson ?? 0) >= 1 },
  { id: "quintillion", emoji: "🪐", name: "천문학적 숫자", desc: "누적 1e24 크레딧", check: (s) => s.totalEarned >= 1e24 },
  { id: "bench_1", emoji: "🎯", name: "벤치마크 사냥꾼", desc: "사이드 벤치마크 첫 정복", check: (s) => s.benchDone.length >= 1 },
  { id: "bench_all", emoji: "🏅", name: "리더보드 독식", desc: "사이드 벤치마크 20종 전부 정복", check: (s) => s.benchDone.length >= 20 },
  { id: "block_1", emoji: "🛡️", name: "안 넘어가요", desc: "탈옥 프롬프트 첫 차단", check: (s) => s.stats.blocked >= 1 },
  { id: "block_50", emoji: "🏰", name: "철벽 정렬", desc: "탈옥 프롬프트 50번 차단", check: (s) => s.stats.blocked >= 50 },
  { id: "breach_1", emoji: "🔓", name: "할머니 공격에 당함", desc: "탈옥 한 번 당해보기", check: (s) => s.stats.breaches >= 1 },
  { id: "mission_1", emoji: "🛰️", name: "첫 출장", desc: "에이전트 파견 첫 완료", check: (s) => s.stats.missionsDone >= 1 },
  { id: "mission_25", emoji: "🧳", name: "출장의 달인", desc: "에이전트 파견 25번 완료", check: (s) => s.stats.missionsDone >= 25 },
  { id: "mission_3", emoji: "🚁", name: "에이전트 군단", desc: "파견 3개 동시 진행", check: (s) => s.missions.length >= 3 },
  { id: "daily_7", emoji: "📅", name: "개근상", desc: "7일 연속 출석", check: (s) => s.daily.streak >= 7 },
  { id: "models_5", emoji: "🗂️", name: "모델 패밀리", desc: "모델 연대기에 5개 기록", check: (s) => s.models.length >= 5 },
  { id: "ending", emoji: "✨", name: "Q.E.D.", desc: "밀레니엄 난제 해결", check: (s) => s.ended },
];
