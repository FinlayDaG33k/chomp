import { ApplicationCommandOption } from "../deps.ts";
import { Discord } from "./discord.ts";
import { Logger } from "../logging/logger.ts";

interface InteractionConfig {
  name: string;
  description: string;
  type: any;
  options?: ApplicationCommandOption[];
  handler: string;
}

export interface Interaction {
  execute(): Promise<void>;
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
      Logger.warning(`Interaction "${interaction}" does not exist! (did you register it?)`);
      return;
    }

    // Create an instance of the handler
    const controller = new InteractionDispatcher.handlers[handler.handler][`${interaction[0].toUpperCase() + interaction.slice(1)}Interaction`](data);

    // Execute the handler's execute method
    try {
      await controller['execute']();
    } catch(e) {
      Logger.error(e.message);
    }
  }
}
