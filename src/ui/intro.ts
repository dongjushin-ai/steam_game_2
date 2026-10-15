// 새 기능 첫 소개: 기능이 처음 쓸 수 있게 되는 순간 한 줄 설명 창 + 그 탭에 NEW.
// 한꺼번에 몰려오지 않게 15초 간격(보스 소개는 바로), 다른 창이 닫힌 뒤 5초, 보스전·튜토리얼 중엔 기다린다.
import type { Game } from "../core/game";
import { L } from "../i18n/lang";
import { showModal, modalOpen } from "./modals";
import type { TabId } from "./panels";
import { featureOn } from "./panels";

interface Feature {
  id: string;
  tab: TabId | null;
  when: (g: Game) => boolean;
  title: () => string;
  body: () => string;
}

const FEATURES: Feature[] = [
  { id: "quests", tab: "service", when: (g) => featureOn(g.state, "quests"),
    title: () => L("임무", "Quests"), body: () => L("서비스 탭에 목표 3개가 생겼어요. 채우면 보상이 자동으로 들어와요. 마음에 안 들면 '바꾸기'.", "Three goals appear in Service. Fill one and the reward drops in automatically. Don't like one? Swap it.") },
  { id: "research", tab: "research", when: (g) => g.state.rp >= 5,
    title: () => L("연구", "Research"), body: () => L("연구 점수로 기술을 배워요. AI가 똑똑해지고(지능) 오래 기억해요(기억력). 연구 탭에서 '연구 가능' 표시를 찾아보세요.", "Spend research score on tech: your AI gets smarter (IQ) and remembers more (memory). Look for 'Ready' in Research.") },
  { id: "boss", tab: "bench", when: (g) => g.bossReady().ok,
    title: () => L("보스: 벤치마크", "Boss: Benchmark"), body: () => L("장면 아래 막대가 35%를 넘으면 도전할 수 있어요. 30초 동안 화면을 연타하면 점수가 더 쌓여요. 이기면 다음 시대!", "When the bar under the scene passes 35% you can challenge. Tap like crazy for 30 seconds to add score. Win to reach the next era!") },
  { id: "thinking", tab: null, when: (g) => g.hasThinking(),
    title: () => L("생각 모드", "Thinking Mode"), body: () => L("장면 아래 '생각' 버튼. 켜면 답이 느리고 비싸지지만 헛소리가 크게 줄어요. 어려운 질문 때 켜 보세요.", "The 'Think' button under the scene. Slower, pricier answers, but far less nonsense. Turn it on for hard questions.") },
  { id: "gacha", tab: "service", when: (g) => g.state.bossesBeaten.length >= 1,
    title: () => L("시드 뽑기", "Seed Gacha"), body: () => L("임무·보스·VIP로 모은 시드로 캡슐을 열어 펫·모자·효과를 뽑아요. 돈은 안 들어요. 서비스 탭에 있어요.", "Open capsules with seeds from quests, bosses and VIPs to get pets, hats and effects. Never costs money. It's in Service.") },
  { id: "missions", tab: "service", when: (g) => g.missionSlots() > 0,
    title: () => L("에이전트 파견", "Agent Missions"), body: () => L("AI를 출장 보내요. 앱을 꺼도 시간이 흐르고, 돌아오면 보상을 받아요.", "Send your AI on trips. Time passes even when the app is closed; collect when they're back.") },
  { id: "side", tab: "bench", when: (g) => g.state.era >= 1 && g.sideBenches().length > 0,
    title: () => L("사이드 벤치마크", "Side Benchmarks"), body: () => L("벤치마크 탭의 작은 시험들. 20초 안에 깨면 영구 보너스를 줘요.", "Small tests in the Bench tab. Clear one in 20 seconds for a permanent bonus.") },
  { id: "release", tab: "bench", when: (g) => g.releaseGain() >= 1,
    title: () => L("새 모델 출시", "Release a New Model"), body: () => L("벤치마크 탭 아래. 돈·연구 점수·모델은 처음부터지만, 체크포인트를 받아 보상과 연구가 영구로 빨라져요. 막혔을 때 쓰는 비장의 카드.", "Bottom of Bench. Money, research score and model reset, but checkpoints permanently speed up rewards and research. Your ace when stuck.") },
  { id: "style", tab: "codex", when: (g) => g.state.achievements.length >= 3,
    title: () => L("꾸미기", "Style"), body: () => L("업적을 깨면 모자·색·효과가 열려요. 도감 › 꾸미기에서 AI를 마음대로 꾸며 보세요.", "Feats unlock hats, colors and effects. Dress up your AI in Codex › Style.") },
  { id: "ranking", tab: "bench", when: (g) => g.state.era >= 2,
    title: () => L("랭킹", "Rankings"), body: () => L("벤치마크 탭 아래 랭킹. 오늘·이번 주·전체 TOP 10에 들면 훈장과 칭호를 받아요 (앱에서).", "Rankings at the bottom of Bench. Make the Top 10 today, this week or all-time for medals and titles (in the app).") },
  { id: "endless", tab: "bench", when: (g) => g.state.ended,
    title: () => L("특이점 너머", "Beyond the Singularity"), body: () => L("엔딩 뒤에도 끝이 아니에요. 벤치마크 탭에서 무한 단계에 도전하세요. 깰수록 AI가 영구로 강해져요.", "The ending isn't the end. Challenge endless levels in Bench; each clear makes your AI permanently stronger.") },
];

const GAP = 15;
/** 다른 창이 닫힌 뒤 숨 돌릴 시간 */
const AFTER_MODAL = 5;
/** 이건 간격을 기다리지 않는다 (놓치면 게임을 이해하기 어려움) */
const URGENT = new Set(["boss"]);

export class Intros {
  private wait = 0;
  private calm = 0;
  /** 소개는 했지만 아직 안 들어가 본 탭 */
  readonly newTabs = new Set<TabId>();

  constructor(private game: Game, private goTab: (t: TabId) => void) {
    const s = game.state.settings;
    // 이미 한참 하던 세이브: 지금 열려 있는 기능은 소개 없이 본 것으로
    if (!s.introSeeded) {
      if (game.state.stats.playSeconds > 120) for (const f of FEATURES) if (f.when(game)) s.seen.push(f.id);
      s.introSeeded = true;
    }
  }

  /** 탭에 들어가면 NEW를 지운다 */
  visit(tab: TabId): void {
    this.newTabs.delete(tab);
  }

  frame(dt: number): void {
    this.wait -= dt;
    this.calm -= dt;
    const g = this.game;
    const s = g.state;
    if (modalOpen()) {
      this.calm = AFTER_MODAL;
      return;
    }
    if (this.calm > 0 || s.boss || s.sideFight || !s.settings.tutorialDone) return;
    const ready = FEATURES.filter((x) => !s.settings.seen.includes(x.id) && x.when(g));
    const f = ready.find((x) => URGENT.has(x.id)) ?? (this.wait > 0 ? undefined : ready[0]);
    if (!f) return;
    s.settings.seen.push(f.id);
    this.wait = GAP;
    if (f.tab) this.newTabs.add(f.tab);
    showModal({
      title: L(`새 기능: ${f.title()}`, `New: ${f.title()}`),
      body: [f.body()],
      buttons: [
        ...(f.tab ? [{ label: L("보러 가기", "Show me"), onClick: () => { this.goTab(f.tab!); } }] : []),
        { label: L("알겠어요", "Got it"), kind: "ghost" as const },
      ],
      dismissable: true,
    });
  }
}
