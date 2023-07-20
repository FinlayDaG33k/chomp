import {ApplicationCommandOption, ApplicationCommandTypes} from "https://deno.land/x/discordeno@13.0.0/mod.ts";
import { Discord } from "../discord.ts";
import { Logger } from "../../logging/logger.ts";
import { isTs } from "../../util/is-ts.ts";
import { folderExists } from "../../util/folder-exists.ts";
import { Inflector } from "../../util/inflector.ts";

export interface InteractionConfig {
  name: string;
  description: string;
  type: ApplicationCommandTypes;
  options?: ApplicationCommandOption[];
  handler: string;
}

export class InteractionDispatcher {
  private static list: InteractionConfig[] = [];
  private static handlers: any = {};

  /**
   * Return the complete list of interactions
   *
   * @returns IInteraction[]
   */
  public static getInteractions() { return InteractionDispatcher.list; }

  /**
   * Find an Interaction by name
   *
   * @param name
   * @returns InteractionConfig|undefined
   */
  public static getHandler(name: string): InteractionConfig|undefined {
    return InteractionDispatcher.list.find((interaction: InteractionConfig) => interaction.name === name);
  }

  /**
   * Update all interactions registered to the Discord gateway
   *
   * @param opts
   * @returns Promise<void>
   */
  public static async update(opts: any): Promise<void> {
    try {
      await Discord.getBot().helpers.upsertApplicationCommands(InteractionDispatcher.getInteractions(), opts.guildId);
    } catch(e) {
      Logger.error(`Could not update interactions: ${e.message}`);
    }
  }

  /**
   * Import an interaction handler and add it to the list of handlers
   *
   * @param interaction
   * @returns Promise<void>
   */
  public static async add(interaction: InteractionConfig): Promise<void> {
    try {
      // Import the interaction handler
      InteractionDispatcher.handlers[interaction.handler] = await import(`file://${Deno.cwd()}/src/interactions/${interaction.handler}.ts`)
    } catch(e) {
      Logger.error(`Could not register interaction handler for "${interaction}": ${e.message}`);
      return;
    }

    InteractionDispatcher.list.push(interaction);
  }

  /**
   * Run an instance of the Interaction handler
   *
   * @param interaction
   * @param data
   * @returns Promise<void>
   */
  public static async dispatch(interaction: string, data: any = {}): Promise<void> {
    // Get the handler
    const handler = InteractionDispatcher.getHandler(interaction);
    if(!handler) {
      Logger.debug(`Interaction "${interaction}" does not exist! (did you register it?)`);
      return;
    }

    // Create an instance of the handler
    const controller = new InteractionDispatcher.handlers[handler.handler][`${Inflector.pascalize(interaction)}Interaction`](data);

    // Execute the handler's execute method
    try {
      await controller['execute']();
    } catch(e) {
      Logger.error(`Could not dispatch interaction "${interaction}": "${e.message}"`, e.stack);
    }
  }

  /**
   * Load all interactions from the required directory.
   * By convention, this will be "src/interactions".
   */
  public static async load(): Promise<void> {
    // Create our directory string
    const dir = `${Deno.cwd()}/src/interactions`;
    Logger.debug(`Loading interactions from "${dir}"...`);
    
    // Make sure the interactions directory exists
    if(!folderExists(dir)) {
      Logger.warning(`"${dir}" does not exist, no interactions to load`);
      return;
    }
    
    // Get a list of all files
    const files = await Deno.readDir(dir);
    
    // Load all interactions
    const promiseQueue: Promise<void>[] = [];
    for await(const file of files) {
      if(!isTs(file.name)) {
        Logger.debug(`File "${file.name}" is not a TS file, skipping...`);
        continue;
      }

      // Import each file as a module
      Logger.debug(`Loading "${file.name}"...`);
      const module = await import(`file:///${dir}/${file.name}`);
      
      // Make sure module has a "config" exposed
      if(!('config' in module)) {
        Logger.warning(`Could not find config in "${interaction.name}", skipping...`);
        continue;
      }
      
      // Register in the dispatcher
      module.config['handler'] = module.config.name;
      promiseQueue.push(InteractionDispatcher.add(module.config));
    }
    
    // Wait until the promise queue has cleared
    await Promise.all(promiseQueue);
  }
}
