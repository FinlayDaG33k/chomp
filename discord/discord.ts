import { createBot, startBot } from "../deps.ts";
import { EventDispatcher } from "./event-dispatcher.ts";

export interface DiscordInitOpts {
  token: string;
  intents: any[];
  botId: bigint|number;
}

export class Discord {
  protected static bot: any;
  protected token: string = '';
  protected intents: any[] = ['Guilds', 'GuildMessages', 'GuildMembers'];
  protected botId: bigint = BigInt(0);

  /**
   * Return the instance of the Discord bot connection
   * TODO: Find out type of Discord.bot
   *
   * @returns any
   */
  public static getBot(): any { return Discord.bot; }

  public constructor(opts: DiscordInitOpts) {
    if(opts.hasOwnProperty('token')) this.token = opts.token;
    if(opts.hasOwnProperty('intents')) this.intents = opts.intents;
    if(opts.hasOwnProperty('botId')) this.botId = BigInt(opts.botId);

    Discord.bot = createBot({
      token: this.token,
      intents: this.intents,
      botId: this.botId,
      events: {
        ready() {
          EventDispatcher.dispatch('BotReady', {});
        },
        messageCreate(bot, message) {
          EventDispatcher.dispatch('MessageReceive', {bot: bot, message: message});
        },
        guildMemberAdd(bot, member, user) {
          EventDispatcher.dispatch('GuildMemberAdd', {member: member, user: user});
        },
        reactionAdd(bot, data) {
          EventDispatcher.dispatch('MessageReactionAdd', data);
        },
        reactionRemove(bot, data) {
          EventDispatcher.dispatch('MessageReactionRemove', data);
        },
        interactionCreate(bot, interaction) {
          EventDispatcher.dispatch('InteractionCreate', interaction);
        }
      }
    });
  }

  /**
   * Start the bot and connect to the Discord gateway
   *
   * @returns Promise<void>
   */
  public async start(): Promise<void> {
    await startBot(Discord.bot);
  }
}
