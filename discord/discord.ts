import { createBot, startBot, DiscordGatewayPayload } from "../deps.ts";
import { EventDispatcher } from "./event-dispatcher.ts";

export interface DiscordInitOpts {
  token: string;
  intents: any[];
  botId: bigint|number;
}

export class Discord {
  protected static bot: any;
  protected token = '';
  protected intents: any[] = ['Guilds', 'GuildMessages', 'GuildMembers'];
  protected botId = BigInt(0);

  /**
   * Return the instance of the Discord bot connection
   * TODO: Find out type of Discord.bot
   *
   * @returns any
   */
  public static getBot(): any { return Discord.bot; }

  public constructor(opts: DiscordInitOpts) {
    if('token' in opts) this.token = opts.token;
    if('intents' in opts) this.intents = opts.intents;
    if('botId' in opts) this.botId = BigInt(opts.botId);

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
        guildMemberAdd(_bot, member, user) {
          EventDispatcher.dispatch('GuildMemberAdd', {member: member, user: user});
        },
        roleCreate(_bot, role) {
          EventDispatcher.dispatch('RoleCreate', {role: role});
        },
        roleDelete(_bot, role) {
          EventDispatcher.dispatch('RoleDelete', {role: role});
        },
        roleUpdate(_bot, role) {
          EventDispatcher.dispatch('RoleUpdate', {role: role});
        },
        reactionAdd(_bot, data) {
          EventDispatcher.dispatch('MessageReactionAdd', data);
        },
        reactionRemove(_bot, data) {
          EventDispatcher.dispatch('MessageReactionRemove', data);
        },
        interactionCreate(_bot, interaction) {
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
