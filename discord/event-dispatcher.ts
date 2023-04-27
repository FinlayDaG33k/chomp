import { Logger } from "../logging/logger.ts";

interface EventConfig {
  name: string;
  handler: string;
}

export interface Event {
  execute(opts: unknown): Promise<void>;
}

export class EventDispatcher {
  private static list: EventConfig[] = [];
  private static handlers: any = {};

  /**
   * Return the complete list of events
   *
   * @returns EventConfig[]
   */
  public static getEvents(): EventConfig[] { return EventDispatcher.list; }

  /**
   * Find an Event by name
   *
   * @param name
   * @returns EvenConfig|undefined
   */
  public static getHandler(name: string): EventConfig|undefined {
    return EventDispatcher.list.find((event: EventConfig) => event.name === name);
  }

  /**
   * Import an event handler and add it to the list of handlers
   * TODO: Make sure class implements Event
   *
   * @param EventConfig event
   * @returns Promise<void>
   */
  public static async add(event: EventConfig): Promise<void> {
    try {
      // Import the source file
      const handler = await import(`file://${Deno.cwd()}/src/events/${event.handler}.ts`);

      // Make sure source file has required class
      if(!(`${event.name}Event` in handler)) throw Error(`No class named "${event.name}Event" could be found!`);
      
      
      // Register handler
      EventDispatcher.handlers[event.handler] = handler;
    } catch(e) {
      Logger.error(`Could not register event handler for "${event.name}": ${e.message}`, e.stack);
      return;
    }

    EventDispatcher.list.push(event);
  }

  /**
   * Run an instance of the Feature handler
   *
   * @param string Event
   * @param any data
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
