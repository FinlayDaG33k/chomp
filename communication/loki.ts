import { Logger } from "../logging/logger.ts";

export interface LokiStream {
  stream: any;
  values: Array<Array<string>>;
}

export class Loki {
  /**
   * @param host
   * @param tenant Tenant ID to use for the log item. Can be ommitted if not using multi-tenant mode.
   */
  public constructor(
    private readonly host: string = 'http://localhost:3100',
    private readonly tenant: string = 'fake',
  ) {
  }

  /**
   * Send a log entry to the Grafana Loki database.
   *
   * @param stream
   */
  public async send(stream: LokiStream|LokiStream[]) {
    try {
      const resp = await fetch(`${this.host}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Scope-OrgID': this.tenant,
        },
        body: JSON.stringify({
          streams: Array.isArray(stream) ? stream : [stream],
        }),
      });
      if(resp.ok === false) throw Error(`Response non-OK: ${resp.statusText}`)
    } catch(e) {
      Logger.error(`Could not add message to Loki: ${e.message}`, e.stack);
    }
  }
}
