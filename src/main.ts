import "./style.css";
import { App } from "./ui/app";
import { isNative } from "./ui/native";

new App().start();

// 앱 안에서는 파일이 이미 기기에 있으니 서비스 워커가 필요 없다 (업데이트가 꼬이지 않게 끈다)
if ("serviceWorker" in navigator && import.meta.env.PROD && !isNative()) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
