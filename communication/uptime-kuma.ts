import {fetchWithTimeout} from "../utility/fetch-with-timeout.ts";
import {raise} from "../mod.ts";

export interface UptimeKumaInstance {
  host?: string;
  id: string;
}

export class UptimeKuma {
  private readonly _host: string = 'http://localhost:3001';
  private readonly _id: string;

  public constructor(config: UptimeKumaInstance) {
    if(config.host) this._host = config.host;
    this._id = config.id;
  }

  /**
   * Send a heartbeat to Uptime Kuma
   *
   * @example
   * ```ts
   * const kuma = new UptimeKuma(data);
   * await kuma.heartbeat();
   * ```
   */
  public async heartbeat(): Promise<true|never> {
    const resp = await fetchWithTimeout(
      `${this._host}/api/push/${this._id}?status=up&msg=OK&ping=`,
      {method: 'GET'},
      5000
    );
    if(resp.status !== 200) raise(`Could not send heartbeat to Uptime Kuma: ${resp.status} - ${resp.statusText}`, 'UptimeKumaHeartbeatNotOK')
    return true;
  }
}
