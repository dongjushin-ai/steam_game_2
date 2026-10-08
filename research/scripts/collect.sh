#!/usr/bin/env bash
# Obscura 헤드리스 브라우저로 자료를 병렬 수집한다.
#   OBSCURA=/path/to/obscura ./research/scripts/collect.sh
# Obscura: https://github.com/h4ckf0r0day/obscura (cargo build --release -p obscura-cli)
set -euo pipefail
cd "$(dirname "$0")/.."
OBSCURA="${OBSCURA:-obscura}"
mkdir -p raw/wiki
"$OBSCURA" scrape $(cat scripts/urls.txt) --concurrency 16 --timeout 30 \
  --eval "$(cat scripts/extract2.js)" --format json --quiet > raw/scrape.json
python3 -I scripts/split.py raw/scrape.json raw/wiki
