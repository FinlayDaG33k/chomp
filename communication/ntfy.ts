import { Logger } from "../logging/logger.ts";

export class Ntfy {
  public constructor(
    private readonly host: string,
    private readonly topic: string,
    private readonly username: string = '',
    private readonly password: string = ''
  ) {
  }

  /**
   * Send a notification through Ntfy
   *
   * @param message
   */
  public async send(message: string): Promise<void> {
    try {
      const auth = btoa(`${this.username}:${this.password}`);
      const resp = await fetch(`${this.host}/${this.topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Basic ${auth}`
        },
        body: message
      });
      if(resp.status === 200) return;
      throw Error(`${resp.status} - ${resp.statusText}`);
    } catch(e) {
      Logger.error(`Could not send notification: "${e.message}"`);
    }
  }
}
