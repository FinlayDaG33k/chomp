import { Logger } from "../../logging/logger.ts";
import { Folder } from "../../filesystem/folder.ts";
import { File } from "../../filesystem/file.ts";
import { Inflector } from "../../utility/inflector.ts";

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

  /**
   * Load all events from the required directory.
   * By convention, this will be "src/events".
   */
  public static async load(): Promise<void> {
    // Create our directory string
    const dir = `${Deno.cwd()}/src/events`;
    Logger.debug(`Loading events from "${dir}"...`);

    // Make sure the interactions directory exists
    if(!await new Folder(dir).exists()) {
      Logger.warning(`"${dir}" does not exist, no events to load.`);
      return;
    }

    // Get a list of all files
    const files = await Deno.readDir(dir);

    // Load all interactions
    const promiseQueue: Promise<void>[] = [];
    for await(const file of files) {
      if(new File(`${dir}/${file.name}`).ext() === 'ts') {
        Logger.debug(`File "${file.name}" is not a TS file, skipping...`);
        continue;
      }

      // Import the file as a module
      Logger.debug(`Loading "${file.name}"...`);
      const module = await import(`file:///${dir}/${file.name}`);
      
      // Make sure the file contains a valid handler
      const name = file.name.replace('.ts', '');
      const eventName = Inflector.pascalize(name, '-');
      const className = `${eventName}Event`;
      if(!(className in module)) {
        Logger.warning(`Could not find ${className} in "${file.name}", skipping...`);
        continue;
      }

      // Register in the dispatcher
      promiseQueue.push(
        EventDispatcher.add({
          name: eventName,
          handler: name,
        })
      );
    }

    // Wait until the promise queue has cleared
    await Promise.all(promiseQueue);
  }
}
