import { timets, formatter } from "../deps.ts";

export class Time {
  private time;
  public get getTime() { return this.time; }

  public constructor(time: string|undefined = undefined) {
    this.time = timets(time).tz(Deno.env.get('TZ')!).t;
  }

  public format(format: string) {
    return formatter(this.time, format);
  }

  public tomorrow() {
    this.time.setDate(this.time.getDate() + 1);
    return this;
  }
}
