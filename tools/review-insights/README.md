# review-insights: 성공한 방치형 게임의 Steam 리뷰로 '플레이어가 실제로 칭찬·불평하는 것' 뽑기

Steam 공개 리뷰 API(키 필요 없음)로 방치형 게임 18개의 리뷰를 모아, 주제별로 긍정·부정 리뷰에서 얼마나 나오는지 비교한다.
결과는 `docs/BENCHMARK.md`의 평가 기준(C1~C11)이 되고, `npm run scorecard`가 그 기준으로 우리 게임을 잰다.

```bash
python3 tools/review-insights/fetch_reviews.py /tmp/reviews     # 게임당 긍정 300 + 부정 300(영어) + 한국어 100, 몇 분
python3 tools/review-insights/themes.py /tmp/reviews            # 주제별 비율과 lift(부정에서 몇 배 더 나오나)
python3 tools/review-insights/quotes.py /tmp/reviews "\b(wall|stuck|grind)\b" 0 10   # 주제별 '도움이 됨'이 많은 부정 문장
```

- 리뷰 원문은 저장소에 넣지 않는다 (작성자 정보·저작권). 집계 결과만 `RESULT-*.txt`로 남긴다.
- 주제는 키워드 정규식으로 센다. 대략적인 신호이므로, 숫자가 튀는 주제는 `quotes.py`로 실제 문장을 읽고 판단한다.
