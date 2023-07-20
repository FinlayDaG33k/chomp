import { Discord } from "./discord.ts";

export class Interaction {
  protected interaction: unknown;
  private _hasReplied: boolean = false;
  
  public constructor(opts: unknown) {
    this.interaction = opts.interaction;
  }

  /**
   * Respond to the interaction.
   * This method will automatically edit the original reply if already replied.
   * 
   * @param data
   */
  public async respond(data: unknown): Promise<void> {
    if(!this._hasReplied) {
      await Discord.getBot().helpers.sendInteractionResponse(
        this.interaction.id,
        this.interaction.token,
        data
      );
      this._hasReplied = true;
      return;
    }
    
    await Discord.getBot().helpers.editInteractionResponse(
      this.interaction.token,
      data
    );
  }
}
