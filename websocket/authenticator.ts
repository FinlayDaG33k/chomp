import { Logger } from "../logging/logger.ts";

export class Authenticator {
  public static client(token: string = ''): boolean {
    if(!token) {
      Logger.debug(`No token has been set! (this may be a bug)`);
      return false;
    }
    return token === Deno.env.get('WEBSOCKET_CLIENT_AUTH');
  }
}
