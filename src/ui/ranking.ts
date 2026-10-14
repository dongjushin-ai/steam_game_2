// 랭킹 화면: 리더보드별·기간별 TOP 10 (구글 플레이 게임즈), 내 순위, 훈장장·칭호.
// 웹이나 설정 전에는 내 기록만 보여 주고 "앱에서" 안내.
import type { Game } from "../core/game";
import { BOARDS, ERAS, LOOK_MAP, SPANS, weekIndex, type Board, type Span } from "../data";
import { RANK_LOOKS, TITLES, boardScore, fmtBoard, grantRank, medalCount, titleName } from "../core/ranking";
import { rarityName } from "../core/looks";
import { L } from "../i18n/lang";
import { clear, h } from "./dom";
import { showModal, toast } from "./modals";
import { PlayGames, gamesStatus, type PgEntry } from "./native";
import { sfx } from "./sound";
import { ic } from "./icons";

const spanName = (s: Span) => ({ daily: L("오늘", "Today"), weekly: L("이번 주", "This week"), all: L("전체", "All-time") })[s];
const tierName = (t: number) => [L("금", "Gold"), L("은", "Silver"), L("동", "Bronze")][t - 1];

function periodKey(span: Span, d = new Date()): string {
  return span === "daily" ? d.toISOString().slice(0, 10) : span === "weekly" ? `w${weekIndex(d)}` : "all";
}

/** 지금 보낼 수 있는 리더보드 (id가 있고 점수가 있는 것) */
const live = (b: Board) => !!b.id;
const lastSent = new Map<string, number>();

/** 점수 보내기: 바뀐 것만. 플레이 게임즈에 로그인돼 있을 때만 */
export async function submitAll(game: Game): Promise<void> {
  const st = await gamesStatus();
  if (!st?.authenticated) return;
  for (const b of BOARDS.filter(live)) {
    const v = boardScore(game.state, b);
    if (v === null || lastSent.get(b.key) === v) continue;
    lastSent.set(b.key, v);
    void PlayGames.submitScore({ id: b.id, score: v }).catch(() => lastSent.delete(b.key));
  }
}

/** 받아 온 내 순위로 훈장·칭호·스킨 지급 + 알림 */
function reward(game: Game, b: Board, span: Span, me: PgEntry | undefined): void {
  if (!me || !me.rank) return;
  const got = grantRank(game.state, b.key, span, periodKey(span), me.rank);
  if (!got.medal) return;
  sfx("win");
  toast(L(`훈장 획득: ${tierName(got.medal.tier)}`, `Medal: ${tierName(got.medal.tier)}`), `${b.name} · ${spanName(span)} · ${me.rank}${L("위", "")}`, "ach rar3");
  for (const t of got.titles) toast(L("칭호 획득!", "New title!"), `「${titleName(t)}」 ${L("— 랭킹 화면에서 달 수 있어요", "— equip it in Rankings")}`, "ach rar3");
  for (const id of got.looks) toast(L(`랭커 전용 꾸미기: ${LOOK_MAP[id].name}`, `Ranker cosmetic: ${LOOK_MAP[id].name}`), L("도감 › 꾸미기", "Codex › Style"), "ach rar3");
  window.dispatchEvent(new CustomEvent("ai-look"));
}

/** 주요 리더보드 3개 × 기간 3개에서 내 순위를 확인 (앱 복귀·보스 승리 때, 10분에 한 번) */
let lastCheck = 0;
export async function checkRanks(game: Game, boards: Board[] = BOARDS.filter((b) => !b.era && b.era !== 0)): Promise<void> {
  if (Date.now() - lastCheck < 10 * 60_000 && boards.length > 1) return;
  const st = await gamesStatus();
  if (!st?.authenticated) return;
  if (boards.length > 1) lastCheck = Date.now();
  for (const b of boards.filter(live)) {
    for (const span of SPANS) {
      // 네트워크가 없으면 조용히 다음 기회에
      try {
        const r = await PlayGames.loadTop({ id: b.id, span, max: 1 });
        reward(game, b, span, r.me);
      } catch {
        continue;
      }
    }
  }
}

/** 랭킹 화면 */
export async function openRanking(game: Game, rerender: () => void): Promise<void> {
  const s = game.state;
  const st = await gamesStatus();
  let board: Board = BOARDS[0];
  let span: Span = "weekly";
  const list = h("div", { class: "rank-list", "aria-live": "polite" });
  const head = h("div", { class: "rank-head" });
  const boardSeg = h("div", { class: "seg rank-seg" });
  const spanSeg = h("div", { class: "seg rank-seg" });
  const taSel = h("select", { class: "rank-ta", "aria-label": L("타임어택 시대", "Time attack era") }) as HTMLSelectElement;
  ERAS.forEach((e, i) => taSel.append(h("option", { value: String(i) }, `${i + 1}. ${e.boss.name}`)));

  const mine = () => {
    const v = boardScore(s, board);
    return v === null ? L("아직 기록 없음", "No record yet") : fmtBoard(board, v);
  };
  const row = (e: PgEntry, me: boolean) => h("div", { class: `rank-row ${me ? "me" : ""} ${e.rank <= 3 ? `top${e.rank}` : ""}` },
    h("b", { class: "rk" }, String(e.rank)), h("span", { class: "nm" }, e.name), h("span", { class: "sc" }, board.kind === "time" ? fmtBoard(board, e.score) : e.display));

  const load = async () => {
    clear(list);
    if (!st) {
      list.append(h("p", { class: "hint" }, L("전 세계 TOP 10은 구글 플레이 앱에서 볼 수 있어요. 내 기록:", "The worldwide Top 10 lives in the Google Play app. Your record:")),
        h("div", { class: "rank-row me" }, h("b", { class: "rk" }, "-"), h("span", { class: "nm" }, s.aiName), h("span", { class: "sc" }, mine())));
      return;
    }
    if (!st.authenticated) {
      list.append(h("p", { class: "hint" }, L("구글 플레이 게임즈에 로그인하면 순위에 올라가요.", "Sign in to Google Play Games to join the rankings.")),
        h("button", { class: "btn", onclick: async () => { const r = await PlayGames.signIn().catch(() => null); if (r?.authenticated) { st.authenticated = true; st.name = r.name; await submitAll(game); void load(); } } }, L("로그인", "Sign in")));
      return;
    }
    if (!board.id) {
      list.append(h("p", { class: "hint" }, L("이 랭킹은 준비 중이에요.", "This leaderboard is coming soon.")));
      return;
    }
    list.append(h("p", { class: "hint" }, L("불러오는 중…", "Loading…")));
    await submitAll(game);
    const r = await PlayGames.loadTop({ id: board.id, span, max: 10 }).catch(() => null);
    clear(list);
    const entries = r?.entries ?? [];
    if (!entries.length) list.append(h("p", { class: "hint" }, L("아직 아무도 없어요. 첫 번째가 되어 보세요!", "Nobody here yet. Be the first!")));
    for (const e of entries) list.append(row(e, !!r?.me && e.rank === r.me.rank && e.name === r.me.name));
    if (r?.me && r.me.rank > 10) list.append(h("div", { class: "rank-gap" }, "⋯"), row(r.me, true));
    if (!r?.me) list.append(h("p", { class: "hint" }, L(`내 기록: ${mine()}`, `Your record: ${mine()}`)));
    reward(game, board, span, r?.me);
  };
  const paintSegs = () => {
    clear(boardSeg);
    for (const [key, label] of [["overall", L("종합", "Overall")], ["feats", L("업적", "Feats")], ["combo", L("콤보", "Combo")], ["ta", L("타임어택", "Time attack")]] as const) {
      const on = key === "ta" ? board.kind === "time" : board.key === key;
      boardSeg.append(h("button", { class: on ? "on" : "", "aria-pressed": on ? "true" : "false", onclick: () => {
        board = key === "ta" ? BOARDS.find((b) => b.key === `ta${taSel.value}`)! : BOARDS.find((b) => b.key === key)!;
        paintSegs(); void load();
      } }, label));
    }
    taSel.style.display = board.kind === "time" ? "" : "none";
    clear(spanSeg);
    for (const sp of SPANS) spanSeg.append(h("button", { class: sp === span ? "on" : "", "aria-pressed": sp === span ? "true" : "false", onclick: () => { span = sp; paintSegs(); void load(); } }, spanName(sp)));
    clear(head);
    head.append(h("b", null, board.name), h("small", null, board.kind === "time" ? L("빠를수록 높아요", "Faster ranks higher") : L("높을수록 높아요", "Higher ranks higher")));
  };
  taSel.onchange = () => { board = BOARDS.find((b) => b.key === `ta${taSel.value}`)!; paintSegs(); void load(); };

  // 훈장장과 칭호
  const [g1, g2, g3] = medalCount(s);
  const titles = h("div", { class: "title-pick" },
    h("button", { class: `chip ${s.ranking.title ? "" : "on"}`, onclick: () => { s.ranking.title = null; rerender(); markTitles(); } }, L("칭호 없음", "No title")),
    ...TITLES.map((t) => {
      const has = s.ranking.titles.includes(t.id);
      return h("button", { class: `chip ${s.ranking.title === t.id ? "on" : ""} ${has ? "" : "locked"}`, "data-id": t.id, disabled: has ? undefined : "", onclick: () => { s.ranking.title = t.id; sfx("buy"); rerender(); markTitles(); } }, has ? `「${t.name()}」` : h("span", null, ic("lock"), t.name()));
    }));
  const markTitles = () => titles.querySelectorAll<HTMLElement>("button").forEach((b) => b.classList.toggle("on", (b.dataset.id ?? null) === s.ranking.title));
  const rankLooks = h("div", { class: "rank-looks" }, ...RANK_LOOKS.map((x) => {
    const has = s.ranking.looks.includes(x.id);
    const it = LOOK_MAP[x.id];
    return h("span", { class: `gift rar${it.rarity} ${has ? "" : "off"}` }, has ? ic("check") : ic("lock"), ` ${rarityName(it.rarity)} ${it.name} · ${x.how()}`);
  }));

  paintSegs();
  showModal({
    title: L("랭킹", "Rankings"),
    sub: st?.authenticated ? L(`${st.name ?? ""} · 구글 플레이 게임즈`, `${st.name ?? ""} · Google Play Games`) : L("TOP 10 · 오늘 / 이번 주 / 전체", "Top 10 · today / this week / all-time"),
    body: [
      boardSeg, taSel, spanSeg, head, list,
      h("h3", { class: "rank-sub" }, L(`훈장 금 ${g1} · 은 ${g2} · 동 ${g3}`, `Medals: ${g1} gold · ${g2} silver · ${g3} bronze`)),
      h("p", { class: "hint" }, L("1위 금, 2~3위 은, 4~10위 동. 기간마다 따로 받아요. 칭호와 랭커 스킨은 랭킹으로만 얻어요.", "#1 gold, #2–3 silver, #4–10 bronze, per period. Titles and ranker cosmetics come only from rankings.")),
      titles, rankLooks,
      ...(st?.authenticated ? [h("button", { class: "btn ghost", onclick: () => void PlayGames.showLeaderboard({ id: board.id || undefined }) }, L("구글 랭킹 화면에서 더 보기", "More in Google Play Games"))] : []),
    ],
    buttons: [{ label: L("닫기", "Close"), kind: "ghost" }],
    dismissable: true,
  });
  void load();
}
