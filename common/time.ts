import { time as timets } from "https://denopkg.com/burhanahmeed/time.ts@v2.0.1/mod.ts";
import { format as formatter } from "https://cdn.deno.land/std/versions/0.77.0/raw/datetime/mod.ts";

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
