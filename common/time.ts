import { time as timets } from "https://denopkg.com/burhanahmeed/time.ts@v2.0.1/mod.ts";
import { format as formatter } from "https://cdn.deno.land/std/versions/0.77.0/raw/datetime/mod.ts";

export class Time {
  private time;
  public get getTime() { return this.time; }
  public get milliseconds() { return this.time.getMilliseconds(); }
  public get seconds() { return this.time.getSeconds(); }
  public get minutes() { return this.time.getMinutes(); }
  public get hours() { return this.time.getHours(); }
  public get weekDay() { return this.time.getDay(); }
  public get monthDay() { return this.time.getDate(); }
  public get month() { return this.time.getMonth(); }
  public get year() { return this.time.getFullYear(); }

  public constructor(time: string|undefined = undefined) {
    this.time = timets(time).tz(Deno.env.get('TZ')!).t;
  }

  public format(format: string) {
    return formatter(this.time, format);
  }

  public midnight() {
    this.time.setHours(0,0,0,0);
    return this;
  }

  public addDay(days: number = 1) {
    this.time.setDate(this.time.getDate() + days);
    return this;
  }

  public addWeek(weeks: number = 1) {
    this.time.setDate(this.time.getDate() + (weeks * 7));
    return this;
  }
}
