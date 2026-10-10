// 친구에게 파일 하나로 건네기 위한 단일 HTML 빌드.
// dist/(vite build 결과)의 CSS·JS·아이콘을 index.html 안에 모두 넣어 dist/ai-kiugi.html 을 만든다.
// 더블클릭으로 열면 바로 실행된다 (인터넷이 없으면 폰트만 기본 글꼴로 바뀐다).
//   npm run build:single
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const assets = readdirSync("dist/assets");
// 글꼴 같은 CSS 속 파일은 data URL로 바꿔 넣는다
const MIME = { woff2: "font/woff2", woff: "font/woff", png: "image/png", svg: "image/svg+xml" };
const css = readFileSync(`dist/assets/${assets.find((f) => f.endsWith(".css"))}`, "utf8").replace(/url\(["']?\.?\/?(?:assets\/)?([\w.-]+\.(woff2|woff|png|svg))["']?\)/g, (_, file, ext) =>
  `url(data:${MIME[ext]};base64,${readFileSync(`dist/assets/${file}`).toString("base64")})`);
const js = readFileSync(`dist/assets/${assets.find((f) => f.endsWith(".js"))}`, "utf8");
const icon = `data:image/svg+xml;base64,${readFileSync("dist/icon.svg").toString("base64")}`;
if (js.includes("</script")) throw new Error("스크립트 안에 </script 가 있어 인라인할 수 없음");

let html = readFileSync("dist/index.html", "utf8");
// 외부 파일 참조 제거: 매니페스트(설치용), 번들 스크립트·스타일 태그
html = html
  .replace(/\s*<link rel="manifest"[^>]*>/, "")
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, "")
  .replace(/\s*<script type="module" crossorigin src="[^"]*"><\/script>/, "")
  .replace(/\s*<link rel="stylesheet" crossorigin href="[^"]*">/, "")
  .replaceAll("./icon.svg", icon);
// 함수 치환을 써서 CSS·JS 안의 '$' 문자가 치환 패턴으로 해석되지 않게 한다
html = html.replace("</head>", () => `    <style>\n${css}\n</style>\n  </head>`);
html = html.replace("</body>", () => `  <script type="module">\n${js.split('"./icon.svg"').join(JSON.stringify(icon))}\n</script>\n  </body>`);

writeFileSync("dist/ai-kiugi.html", html);
console.log(`dist/ai-kiugi.html (${(html.length / 1024).toFixed(0)} KB)`);
