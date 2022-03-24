import { Logger } from "../logging/logger.ts";

interface IEvent {
  name: string;
  handler: string;
}

export class Events {
  private static list: IEvent[] = [];
  private static handlers: any = {};
  public static getEvents() { return Events.list; }

  public static getHandler(name: string) {
    return Events.list.find((event: IEvent) => event.name === name);
  }

  public static async add(event: IEvent) {
    try {
      // Import the event handler
      Events.handlers[event.handler] = await import(`file://${Deno.cwd()}/src/events/${event.handler}.ts`)
    } catch(e) {
      Logger.error(`Could not register event handler for "${event}": ${e.message}`);
      return;
    }

    Events.list.push(event);
  }

  public static async dispatch(event: string, data: any = {}) {
    // Get the event handler
    const handler = Events.getHandler(event);
    if(!handler) return Logger.warning(`Event "${event}" does not exist! (did you register it?`);

    // Create an instance of the event handler
    const controller = new Events.handlers[handler.handler][`${event}Event`](data);

    // Execute the handler's execute method
    try {
      await controller['execute'](data);
    } catch(e) {
      Logger.error(e.message);
    }
  }
}
