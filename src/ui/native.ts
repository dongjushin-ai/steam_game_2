// 안드로이드 앱(Capacitor)에서만 켜지는 것들. 웹에서는 아무것도 하지 않는다.
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { backModal } from "./modals";

export const isNative = (): boolean => Capacitor.isNativePlatform();

export interface NativeHooks {
  save: () => void;
  /** 첫 탭이 아니면 첫 탭으로 돌아가고 true */
  backTab: () => boolean;
}

export function setupNative(hooks: NativeHooks): void {
  if (!isNative()) return;
  document.documentElement.classList.add("native");
  void CapApp.addListener("backButton", () => {
    // 컷신은 '건너뛰기' 버튼으로만 닫는다 (실수로 엔딩을 날리지 않게)
    const skip = document.querySelector<HTMLButtonElement>(".cutscene .cut-skip");
    if (skip) return;
    if (backModal()) return;
    if (hooks.backTab()) return;
    // 방치형이라 종료 대신 홈으로 내린다. 그 전에 저장.
    hooks.save();
    void CapApp.minimizeApp();
  });
  void CapApp.addListener("pause", () => hooks.save());
}

/** 앱에서는 웹 공유·다운로드가 안 되니 캐시에 PNG를 쓰고 안드로이드 공유 창을 띄운다 (갤러리 저장도 여기서) */
export async function shareImage(dataUrl: string, name: string, text: string): Promise<void> {
  const res = await Filesystem.writeFile({ path: name, data: dataUrl.split(",")[1], directory: Directory.Cache });
  await Share.share({ files: [res.uri], text });
}
