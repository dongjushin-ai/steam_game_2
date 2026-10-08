import "./style.css";
import { App } from "./ui/app";

new App().start();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
