import { Logger } from "../logging/logger.ts";
import { Configure } from "../core/configure.ts";

export class Authenticator {
  /**
   * Check whether the passed token matches the "websocket_client_auth" key in the Configure
   *
   * @param token
   */
  public static client(token: string = ''): boolean {
    if(!token) {
      Logger.debug(`No token has been set! (this may be a bug)`);
      return false;
    }
    return token === Configure.get('websocket_client_auth', '');
  }
}
