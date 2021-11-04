import { Websocket } from "../websocket/websocket.ts";

declare global {
  interface Window {
    websocket: Websocket;
  }
}
