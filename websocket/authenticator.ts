import { Logger } from "../logging/logger.ts";
import { Configure } from "../common/configure.ts";

export class Authenticator {
  public static client(token: string = ''): boolean {
    if(!token) {
      Logger.debug(`No token has been set! (this may be a bug)`);
      return false;
    }
    return token === Configure.get('websocket_client_auth', '');
  }
}
