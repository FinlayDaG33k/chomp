interface IEvent {
  name: string;
  handler: string;
}

export class Events {
  private static list: IEvent[] = [];
  public static getEvents() { return Events.list; }

  public static getHandler(name: string) {
    return Events.list.find((event: IEvent) => event.name === name);
  }

  public static add(event: IEvent) {
    Events.list.push(event);
  }
}
