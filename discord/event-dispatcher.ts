import { Logger } from "../logging/logger.ts";

interface EventConfig {
  name: string;
  handler: string;
}

export interface Event {
  execute(opts: any): Promise<void>;
}

export class EventDispatcher {
  private static list: EventConfig[] = [];
  private static handlers: any = {};

  /**
   * Return the complete list of events
   *
   * @returns EventConfig[]
   */
  public static getEvents() { return EventDispatcher.list; }

  /**
   * Find an Event by name
   *
   * @param name
   * @returns IEvent|undefined
   */
  public static getHandler(name: string): EventConfig|undefined {
    return EventDispatcher.list.find((event: EventConfig) => event.name === name);
  }

  /**
   * Import an event handler and add it to the list of handlers
   *
   * @param event
   * @returns Promise<void>
   */
  public static async add(event: EventConfig): Promise<void> {
    try {
      // Import the event handler
      EventDispatcher.handlers[event.handler] = await import(`file://${Deno.cwd()}/src/events/${event.handler}.ts`)
    } catch(e) {
      Logger.error(`Could not register event handler for "${event.name}": ${e.message}`, e.stack);
      return;
    }

    EventDispatcher.list.push(event);
  }

  /**
   * Run an instance of the Feature handler
   *
   * @param event
   * @param data
   * @returns Promise<void>
   */
  public static async dispatch(event: string, data: any = {}): Promise<void> {
    // Get the event handler
    const handler = EventDispatcher.getHandler(event);
    if(!handler) return Logger.debug(`Event "${event}" does not exist! (did you register it?)`);

    // Create an instance of the event handler
    const controller = new EventDispatcher.handlers[handler.handler][`${event}Event`](data);

    // Execute the handler's execute method
    try {
      await controller['execute'](data);
    } catch(e) {
      Logger.error(`Could not dispatch event "${event}": "${e.message}"`, e.stack);
    }
  }
}
