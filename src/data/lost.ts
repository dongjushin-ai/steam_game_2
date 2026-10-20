// 잃어버린 기술: 만들어졌다가 잊히거나 사라졌고, 나중에 다시 발견·복원된 실제 기술 (마지막 하나만 팬픽).
// 무작위 사건 대신 가끔 '발굴'되고, 찾으면 작은 영구 보너스. 새 모델 출시로도 사라지지 않는다.
import type { Effect, LostTech, MultStat } from "../core/types";

const fx = (pairs: Partial<Record<MultStat, number>>): Effect[] =>
  Object.entries(pairs).map(([stat, mul]) => ({ stat: stat as MultStat, mul: mul as number }));

export const LOST: LostTech[] = [
  { id: "antikythera", era: 0, year: "BC 100년경 → 1901", emoji: "⚙️", name: "안티키테라 기계", effects: fx({ reward: 1.1 }),
    desc: "기원전 2~1세기에 만든 청동 톱니바퀴 계산기. 해와 달의 위치와 일식을 계산했다. 1901년 그리스 난파선에서 건져 올렸고, 2000년대 CT 촬영으로 속 구조가 밝혀졌다." },
  { id: "difference_engine", era: 0, year: "1849 → 1991", emoji: "🧮", name: "차분기관 2호", effects: fx({ tps: 1.1 }),
    desc: "배비지가 1849년에 설계했지만 만들지 못했다. 1991년 런던 과학박물관이 그 시절의 가공 정밀도로 설계도대로 만들었고, 실제로 작동했다." },
  { id: "mark1_perceptron", era: 1, year: "1958", emoji: "👁️", name: "마크 I 퍼셉트론", effects: fx({ intel: 1.1 }),
    desc: "로젠블랫이 만든 하드웨어 신경망. 20×20개 광센서로 글자 모양을 배웠다. 1969년 이후 신경망 연구가 얼어붙으며 잊혔고, 지금은 스미스소니언 박물관에 있다." },
  { id: "analog_computer", era: 2, year: "1950년대 → 2020년대", emoji: "🎛️", name: "아날로그 컴퓨터", effects: fx({ power: 1.1 }),
    desc: "전압과 저항으로 미분방정식을 풀던 기계. 디지털 컴퓨터에 밀려 사라졌다가, 2020년대 전기를 아끼는 아날로그 AI 칩 연구로 다시 돌아왔다." },
  { id: "rope_memory", era: 2, year: "1969 → 2019", emoji: "🧶", name: "코어 로프 메모리", effects: fx({ demand: 1.1 }),
    desc: "아폴로 우주선 컴퓨터의 프로그램은 구리선을 자석 고리 사이로 손으로 꿰어 저장했다. 사라진 기술이 됐지만, 2019년 복원 팀이 남아 있던 아폴로 유도 컴퓨터를 다시 돌렸다." },
  { id: "neocognitron", era: 3, year: "1980", emoji: "🔍", name: "네오코그니트론", effects: fx({ hall: 0.9 }),
    desc: "후쿠시마 구니히코가 만든 시각 신경망. 오늘날 합성곱 신경망(CNN)의 조상이지만, 오랫동안 주목받지 못했다." },
  { id: "backprop_1970", era: 3, year: "1970 → 1986", emoji: "📜", name: "잊힌 역전파", effects: fx({ rp: 1.1 }),
    desc: "1970년 핀란드의 한 석사 논문에 오늘날 역전파의 수학(자동 미분의 역방향 모드)이 이미 있었다. 1974년 신경망에 쓰자는 박사 논문도 나왔지만, 널리 쓰인 건 1986년이 되어서다." },
  { id: "lisp_machine", era: 3, year: "1980년대 → 1987", emoji: "🖥️", name: "LISP 머신", effects: fx({ cost: 0.95 }),
    desc: "AI 프로그램 전용으로 만든 컴퓨터. 1987년 값싼 워크스테이션에 밀려 시장이 무너졌다. 가비지 컬렉션 같은 아이디어는 오늘날 프로그래밍 언어 속에 살아 있다." },
  { id: "connection_machine", era: 4, year: "1985 → 1994", emoji: "🧊", name: "커넥션 머신", effects: fx({ tps: 1.1 }),
    desc: "최대 65,536개 프로세서를 한꺼번에 돌린 병렬 컴퓨터. 만든 회사는 1994년 문을 닫았지만, 아주 많은 작은 프로세서로 계산한다는 생각은 GPU로 이어졌다." },
  { id: "optical_computing", era: 4, year: "1980년대 → 2020년대", emoji: "🔦", name: "광 컴퓨팅", effects: fx({ powerUse: 0.95 }),
    desc: "빛으로 계산하자는 연구가 1980~90년대에 활발했다가 전자 칩을 따라가지 못해 시들었다. 2020년대 AI 칩의 전력 문제로 다시 주목받고 있다." },
  { id: "geocities", era: 5, year: "2009", emoji: "🕸️", name: "지오시티즈 아카이브", effects: fx({ demand: 1.1 }),
    desc: "1990년대 개인 홈페이지 수백만 개가 있던 지오시티즈가 2009년 문을 닫았다. 자원봉사자 모임 '아카이브 팀'이 닫히기 전에 상당 부분을 내려받아 살려 냈다." },
  { id: "cobol", era: 7, year: "1959 → 2020", emoji: "🏦", name: "코볼", effects: fx({ reward: 1.1 }),
    desc: "1959년에 만든 프로그래밍 언어 코볼은 아직도 은행과 정부 시스템에서 돈다. 2020년 미국의 몇몇 주는 오래된 행정 시스템을 고칠 코볼 개발자를 급히 찾았다." },
  { id: "human_dataset", era: 10, year: "20XX", emoji: "✍️", name: "사람이 쓴 마지막 데이터 (팬픽)", effects: fx({ hall: 0.85 }),
    desc: "기계가 쓴 글이 인터넷을 덮은 뒤, 사람이 직접 쓴 글은 귀한 데이터가 됐다. 오래된 서버 창고에서 기계 글이 넘치기 전의 웹 사본이 발견됐다." },
];

export const LOST_MAP: Record<string, LostTech> = Object.fromEntries(LOST.map((x) => [x.id, x]));
