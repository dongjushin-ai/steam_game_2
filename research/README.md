# research/ — AI 키우기 자료 수집

## 수집 방법: Obscura
[Obscura](https://github.com/h4ckf0r0day/obscura) — Rust로 만든 경량 헤드리스 브라우저(V8 내장, 크로미움 불필요)로 수집했다.

- 1차: Wikipedia 94페이지 → **10.3초** (동시 16개, 페이지당 평균 110ms)
- 2차: Wikipedia + 공식 가격 문서 103페이지 → **20.1초** (101개 성공)
- 합계 **195개 문서, 4.0MB 텍스트**. API 키나 유료 서비스 없이 수집함.
- 실패 2건: `DQN`(Wikipedia 리다이렉트 문서), `modelcontextprotocol.io`(네트워크 차단) → MCP 내용은 Wikipedia 문서로 대체.

### 재현
```bash
git clone https://github.com/h4ckf0r0day/obscura && cd obscura
cargo build --release -p obscura-cli          # 약 5분
OBSCURA=$PWD/target/release/obscura ../steam_game_2/research/scripts/collect.sh
```
- `scripts/urls.txt` — 수집 대상 URL 197개
- `scripts/extract2.js` — 본문만 남기는 추출 스크립트(각주·내비게이션 제거, `--eval`로 실행)
- `scripts/split.py` — 결과 JSON을 페이지별 `.md`로 나눔

## 결과물
| 파일 | 내용 |
|---|---|
| [`01_ai_timeline.md`](01_ai_timeline.md) | 고대 ~ 2026 AI 역사 → 게임 시대(Era 0~10) 매핑 |
| [`02_game_elements.md`](02_game_elements.md) | 재화·스탯·업그레이드 트리·질문 티어·보스·토큰 단가 |
| [`03_events.md`](03_events.md) | 랜덤 이벤트 30종 + 사용 금지 목록 |
| `raw/wiki/` | 원문 텍스트 (Wikipedia: CC BY-SA 4.0, 각 파일 첫 줄에 출처 URL) |
