import { Logger } from "../core/logger.ts";

export enum Precision {
  s,
  ms,
  us,
  ns,
}

interface Api {
  url: string;
  auth: string;
  precision: Precision;
}

/**
 * Interact with InfluxDB
 */
export class InfluxDB {
  private _api: Api;

  public constructor(
    url: string,
    token: string,
    org: string,
    bucket: string,
    precision: Precision = Precision.us
  ) {
    this._api = {
      url: `${url}/api/v2/write?org=${org}&bucket=${bucket}&precision=${Precision[precision]}`,
      auth: `Token ${token}`,
      precision: precision,
    };
  }

  /**
   * Write our datapoint(s) to InfluxDB
   *
   * @param data
   */
  public async write(data: Point | Point[]): Promise<boolean> {
    // Convert point(s) to Line Protocol entry
    let points = "";
    if (Array.isArray(data)) {
      for await (const point of data) {
        points += `${point.toLine(this._api.precision)}\n`;
      }
    } else {
      points = data.toLine(this._api.precision);
    }

    // Write line to InfluxDB
    try {
      const resp = await fetch(this._api.url, {
        headers: {
          Authorization: this._api.auth,
          "Content-Type": "text/plain",
        },
        method: "POST",
        body: points,
      });
      return resp.ok;
    } catch (e) {
      Logger.error(`Could not write point(s) to InfluxDB`, e.stack);
      return false;
    }
  }
}

export class Point {
  private _tags: Map<string, string> = new Map<string, string>();
  private _fields: Map<string, string | number> = new Map<string, string | number>();
  private _timestamp: Date | number = 0;

  public constructor(
    private readonly measurement: string,
  ) {
  }

  /**
   * Add a tag to our point
   *
   * @param key
   * @param value
   */
  public addTag(key: string, value: string): this {
    this._tags.set(key, value);
    return this;
  }

  /**
   * Add a field to our point
   *
   * @param key
   * @param value
   */
  public addField(key: string, value: string | number): this {
    this._fields.set(key, value);
    return this;
  }

  /**
   * Set our timestamp for the point.
   * Can be either a date or a number.
   * In the case that this is a number, it must be in the correct precision units.
   *
   * @param ts
   */
  public setTimestamp(ts: Date | number): this {
    this._timestamp = ts;
    return this;
  }

  public toLine(precision: Precision = Precision.us): string {
    // Start off with a blank string
    let line = "";

    // Set the measurement
    line += this.measurement;

    // Add all tags
    for (const [key, value] of this._tags.entries()) {
      line += `,${key}=${value}`;
    }

    // Add separator before fieldset
    line += " ";

    // Add all fields
    const entries = [];
    for (const [key, value] of this._fields.entries()) {
      entries.push(`${key}=${value}`);
    }
    line += entries.join(",");

    // Add timestamp
    let ts = 0;
    if (this._timestamp instanceof Date) {
      ts = this._timestamp.getTime();
      switch (precision) {
        case Precision.s:
          ts = Math.trunc(ts / 1_000);
          break;
        case Precision.ms:
          break;
        case Precision.us:
          ts = ts * 1_000;
          break;
        case Precision.ns:
          ts = ts * 1_000_000;
          break;
      }
    } else {
      ts = this._timestamp;
    }
    line += ` ${ts}`;

    // Return our final line
    return line;
  }
}
