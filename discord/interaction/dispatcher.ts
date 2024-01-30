import {ApplicationCommandOption, ApplicationCommandTypes, BigString} from "../mod.ts";
import { Discord } from "../discord.ts";
import { Logger } from "../../logging/logger.ts";
import { File } from "../../filesystem/file.ts";
import { Folder } from "../../filesystem/folder.ts";
import { Inflector } from "../../utility/inflector.ts";
import { InteractionBuilder } from "./builder.ts";

export interface InteractionConfig {
  name: string;
  description: string;
  type: ApplicationCommandTypes;
  options?: ApplicationCommandOption[];
  handler: string;
}

export class InteractionDispatcher {
  private static _interactionsDir = `${Deno.cwd()}/src/interactions`;
  private static list: InteractionConfig[] = [];
  // deno-lint-ignore no-explicit-any -- TODO
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
  public static async update(opts: {guildId: bigint|BigString}): Promise<void> {
    try {
      await Discord.getBot()?.helpers.upsertGuildApplicationCommands(opts.guildId.toString(), InteractionDispatcher.getInteractions());
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
      InteractionDispatcher.handlers[interaction.handler] = await import(`file://${InteractionDispatcher._interactionsDir}/${interaction.handler}.ts`)
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
  // deno-lint-ignore no-explicit-any -- TODO
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
    await controller['execute']();
  }

  /**
   * Load all interactions from the required directory.
   * By convention, this will be "src/interactions".
   */
  public static async load(): Promise<void> {
    // Create our directory string
    Logger.debug(`Loading interactions from "${InteractionDispatcher._interactionsDir}"...`);

    // Make sure the interactions directory exists
    if(!await new Folder(InteractionDispatcher._interactionsDir).exists()) {
      Logger.warning(`"${InteractionDispatcher._interactionsDir}" does not exist, no interactions to load`);
      return;
    }

    // Get a list of all files
    const files = await Deno.readDir(InteractionDispatcher._interactionsDir);

    // Load all interactions
    const promiseQueue: Promise<void>[] = [];
    for await(const file of files) {
      if(new File(`${InteractionDispatcher._interactionsDir}/${file.name}`).ext() === '.ts') {
        Logger.debug(`File "${file.name}" is not a TS file, skipping...`);
        continue;
      }

      // Import each file as a module
      Logger.debug(`Loading "${file.name}"...`);
      const module = await import(`file:///${InteractionDispatcher._interactionsDir}/${file.name}`);

      // Get the interaction name
      let name = file.name.replace(".ts", "");
      name = Inflector.pascalize(name);
      
      // Check if the module contains the interaction class
      if(!(`${name}Interaction` in module)) {
        Logger.warning(`Could not find "${name}Interaction" in "${file.name}"...`);
        continue;
      }

      // Make sure module has a "config" exposed
      if(!('config' in module)) {
        Logger.warning(`Could not find config in "${interaction.name}", skipping...`);
        continue;
      }
      
      // Register in dispatcher
      // TODO: Remove support for registering as object.
      switch(typeof module.config) {
        case 'object': {
          Logger.warning(`Registering module configs as objects is deprecated. Please use the "InteractionBuilder" instead.`);
          module.config['handler'] = module.config.name;
          promiseQueue.push(InteractionDispatcher.add(module.config));
          break;
        }
        case 'function': {
          const config = module.config(new InteractionBuilder()).toJSON();
          config['handler'] = config.name;
          promiseQueue.push(InteractionDispatcher.add(config));
          break;
        }
      }
    }

    // Wait until the promise queue has cleared
    await Promise.all(promiseQueue);
  }
}
