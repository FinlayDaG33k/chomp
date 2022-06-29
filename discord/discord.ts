import { createBot, startBot } from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
import { enableCachePlugin, enableCacheSweepers } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";
import { EventDispatcher } from "./event-dispatcher.ts";

export interface DiscordInitOpts {
  token: string;
  intents: any[];
  botId: bigint|number;
  withCache?: boolean;
}

export class Discord {
  protected static bot: any;
  protected token = '';
  protected intents: any[] = ['Guilds', 'GuildMessages', 'GuildMembers'];
  protected botId = BigInt(0);
  protected enableCache = false;

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
    if('withCache' in opts) this.enableCache = opts.withCache || false;

    let baseBot = createBot({
      token: this.token,
      intents: this.intents,
      botId: this.botId,
      events: {
        ready() {
          EventDispatcher.dispatch('BotReady', {});
        },
        guildCreate(bot, guild) {
          EventDispatcher.dispatch('GuildCreate', {guild: guild});
        },
        guildLoaded(bot, data) {
          EventDispatcher.dispatch('GuildLoaded', data);
        },
        messageCreate(bot, message) {
          EventDispatcher.dispatch('MessageReceive', {bot: bot, message: message});
        },
        guildMemberAdd(_bot, member, user) {
          EventDispatcher.dispatch('GuildMemberAdd', {member: member, user: user});
        },
        guildMemberRemove(_bot, user) {
          EventDispatcher.dispatch('GuildMemberRemove', {user: user});
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

    // Enable cache if required
    if(this.enableCache === true) {
      const bot = enableCachePlugin(baseBot);
      enableCacheSweepers(bot);
      Discord.bot = bot;
    } else {
      Discord.bot = baseBot;
    }
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
