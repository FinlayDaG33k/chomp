import {Discord, DiscordInteraction, InteractionCallbackData, InteractionResponse} from "../mod.ts";

export class Interaction {
  protected interaction: DiscordInteraction;
  private _hasReplied: boolean = false;
  
  public constructor(opts: {interaction: DiscordInteraction}) {
    this.interaction = opts.interaction;
  }

  /**
   * Main logic for the interaction.
   * 
   * @returns Promise<void>
   */
  public async execute?(): Promise<void>;

  /**
   * Respond to the interaction.
   * This method will automatically edit the original reply if already replied.
   * 
   * @param data
   */
  protected async respond(data: InteractionResponse|InteractionCallbackData): Promise<void> {
    if(!this._hasReplied) {
      await Discord.getBot().helpers.sendInteractionResponse(
        this.interaction.id,
        this.interaction.token,
        data as InteractionResponse
      );
      this._hasReplied = true;
      return;
    }
    
    await Discord.getBot().helpers.editOriginalInteractionResponse(
      this.interaction.token,
      data as InteractionCallbackData
    );
  }
}
