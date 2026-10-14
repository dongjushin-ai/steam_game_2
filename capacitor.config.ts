import type { CapacitorConfig } from "@capacitor/cli";

// 안드로이드 앱 포장 설정. appId는 첫 업로드 후 바꿀 수 없다 (docs/RELEASE.md 참고).
const config: CapacitorConfig = {
  appId: "io.github.dongjushinai.aikiugi",
  appName: "AI 키우기",
  webDir: "dist",
  android: {
    backgroundColor: "#000000",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
