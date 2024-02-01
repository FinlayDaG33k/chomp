import { 
  createBot, 
  startBot, 
  Bot, 
  BotWithCache,
  enableCachePlugin,
  enableCacheSweepers,
  EventDispatcher,
  InteractionDispatcher
} from "./mod.ts";
import { Logger } from "../logging/logger.ts";

export interface DiscordInitOpts {
  token: string;
  intents: number;
  botId: bigint|number;
  withCache?: boolean;
  withSweeper?: boolean;
}

export class Discord {
  protected static bot: Bot|BotWithCache|undefined;
  protected token = '';
  protected intents: number;
  protected botId = BigInt(0);

  /**
   * Return the instance of the Discord bot connection
   */
  public static getBot(): Bot|BotWithCache|undefined { return Discord.bot; }

  public constructor(opts: DiscordInitOpts) {
    // Make sure required parameters are present
    if('token' in opts) {
      this.token = opts.token;
    } else {
      Logger.error('No Discord bot token was provided!');
      Deno.exit(1);
    }
    this.intents = 'intents' in opts ? opts.intents : 0;
    if('botId' in opts) this.botId = BigInt(opts.botId);

    const baseBot = createBot({
      token: this.token,
      intents: this.intents,
      botId: this.botId,
      events: {
        botUpdate(_bot, user) {
          EventDispatcher.dispatch('BotUpdate', user);
        },
        channelCreate(_bot, channel) {
          EventDispatcher.dispatch('ChannelCreate', channel);
        },
        channelDelete(_bot, channel) {
          EventDispatcher.dispatch('ChannelDelete', channel);
        },
        channelPinsUpdate(_bot, data) {
          EventDispatcher.dispatch('ChannelPinsUpdate', data);
        },
        channelUpdate(_bot, channel) {
          EventDispatcher.dispatch('ChannelUpdate', channel);
        },
        // deno-lint-ignore no-explicit-any -- Set by Discordeno
        debug(text, ...args: any[]) {
          EventDispatcher.dispatch('Debug', { text: text, args: args });
        },
        dispatchRequirements(_bot, data, shardId) {
          EventDispatcher.dispatch('DispatchRequirements', { data: data, shardId: shardId });
        },
        guildBanAdd(_bot, user, guildId) {
          EventDispatcher.dispatch('GuildBanAdd', { user: user, guildId: guildId });
        },
        guildBanRemove(_bot, user, guildId) {
          EventDispatcher.dispatch('GuildBanRemove', { user: user, guildId: guildId });
        },
        guildCreate(_bot, guild) {
          EventDispatcher.dispatch('GuildCreate', guild);
        },
        guildDelete(_bot, id, shardId) {
          EventDispatcher.dispatch('GuildDelete', { id: id, shardId: shardId });
        },
        guildEmojisUpdate(_bot, payload) {
          EventDispatcher.dispatch('guildEmojisUpdate', payload);
        },
        guildMemberAdd(_bot, member, user) {
          EventDispatcher.dispatch('GuildMemberAdd', { member: member, user: user });
        },
        guildMemberRemove(_bot, user) {
          EventDispatcher.dispatch('GuildMemberRemove', user);
        },
        guildMemberUpdate(_bot, member, user) {
          EventDispatcher.dispatch('GuildMemberUpdate', { member: member, user: user });
        },
        guildUpdate(_bot, guild) {
          EventDispatcher.dispatch('GuildUpdate', guild);
        },
        integrationCreate(_bot, integration) {
          EventDispatcher.dispatch('IntegrationCreate', integration);
        },
        integrationDelete(_bot, payload) {
          EventDispatcher.dispatch('IntegrationDelete', payload);
        },
        integrationUpdate(_bot, payload) {
          EventDispatcher.dispatch('IntegrationUpdate', payload);
        },
        interactionCreate(_bot, interaction) {
          EventDispatcher.dispatch('InteractionCreate', interaction);
        },
        inviteCreate(_bot, invite) {
          EventDispatcher.dispatch('InviteCreate', invite);
        },
        inviteDelete(_bot, payload) {
          EventDispatcher.dispatch('InviteDelete', payload);
        },
        messageCreate(_bot, message) {
          // Remapped to "MessageReceive"
          // Reason: Easier to understand
          EventDispatcher.dispatch('MessageReceive', { message: message });
        },
        messageDelete(_bot, payload, message?) {
          EventDispatcher.dispatch('MessageDelete', { payload: payload, message: message });
        },
        messageUpdate(_bot, message, oldMessage?) {
          EventDispatcher.dispatch('MessageUpdate', { message: message, oldMessage: oldMessage });
        },
        presenceUpdate(_bot, presence, oldPresence?) {
          EventDispatcher.dispatch('PresenceUpdate', { presence: presence, oldPresence: oldPresence });
        },
        raw(_bot, data, shardId) {
          EventDispatcher.dispatch('Raw', { data: data, shardId: shardId });
        },
        reactionAdd(_bot, payload) {
          // Remapped to "MessageReactionAdd"
          // Reason: Easier to understand
          EventDispatcher.dispatch('MessageReactionAdd', payload);
        },
        reactionRemove(_bot, data) {
          // Remapped to "MessageReactionRemove"
          // Reason: Easier to understand
          EventDispatcher.dispatch('MessageReactionRemove', data);
        },
        reactionRemoveAll(_bot, payload) {
          // Remapped to "MessageReactionRemoveAll"
          // Reason: Easier to understand
          EventDispatcher.dispatch('MessageReactionRemoveAll', payload);
        },
        reactionRemoveEmoji(_bot, payload) {
          EventDispatcher.dispatch('ReactionRemoveEmoji', payload);
        },
        ready(_bot, payload, rawPayload) {
          // Remapped to "BotReady"
          // Reason: Easier to understand
          EventDispatcher.dispatch('BotReady', { payload: payload, rawPayload: rawPayload });
        },
        roleCreate(_bot, role) {
          EventDispatcher.dispatch('RoleCreate', role);
        },
        roleDelete(_bot, role) {
          EventDispatcher.dispatch('RoleDelete', role);
        },
        roleUpdate(_bot, role) {
          EventDispatcher.dispatch('RoleUpdate', role);
        },
        scheduledEventCreate(_bot, event) {
          EventDispatcher.dispatch('ScheduledEventCreate', event);
        },
        scheduledEventDelete(_bot,event) {
          EventDispatcher.dispatch('ScheduledEventDelete', event);
        },
        scheduledEventUpdate(_bot,event) {
          EventDispatcher.dispatch('ScheduledEventUpdate', event);
        },
        scheduledEventUserAdd(_bot, payload) {
          EventDispatcher.dispatch('ScheduledEventUserAdd', payload);
        },
        scheduledEventUserRemove(_bot, payload) {
          EventDispatcher.dispatch('ScheduledEventUserRemove', payload);
        },
        stageInstanceCreate(_bot, data) {
          EventDispatcher.dispatch('StageInstanceCreate', data);
        },
        stageInstanceDelete(_bot, data) {
          EventDispatcher.dispatch('StageInstanceDelete', data);
        },
        stageInstanceUpdate(_bot, data) {
          EventDispatcher.dispatch('StageInstanceUpdate', data);
        },
        threadCreate(_bot, thread) {
          EventDispatcher.dispatch('ThreadCreate', thread);
        },
        threadDelete(_bot, thread) {
          EventDispatcher.dispatch('ThreadDelete', thread);
        },
        threadMembersUpdate(_bot, payload) {
          EventDispatcher.dispatch('ThreadMembersUpdate', payload);
        },
        threadUpdate(_bot, thread) {
          EventDispatcher.dispatch('ThreadUpdate', thread);
        },
        typingStart(_bot, payload) {
          EventDispatcher.dispatch('TypingStart', payload);
        },
        voiceServerUpdate(_bot, payload) {
          EventDispatcher.dispatch('VoiceServerUpdate', payload);
        },
        voiceStateUpdate(_bot, voiceState) {
          EventDispatcher.dispatch('VoiceStateUpdate', voiceState);
        },
        webhooksUpdate(_bot, payload) {
          EventDispatcher.dispatch('WebhooksUpdate', payload);
        },
      }
    });

    // Enable cache if required
    Discord.bot = Discord.enableCache(baseBot, opts);
  }

  /**
   * Start the bot and connect to the Discord gateway
   *
   * @returns Promise<void>
   */
  public async start(): Promise<void> {
    if(!Discord.bot) throw Error('Bot is not configured!');
    await EventDispatcher.load();
    await InteractionDispatcher.load();
    await startBot(Discord.bot);
  }

  /**
   * Checks whether cache needs to be enabled.
   * Add both cache and sweeper if required.
   *
   * @param bot
   * @param opts
   */
  private static enableCache(bot: Bot, opts: DiscordInitOpts): Bot|BotWithCache {
    // Return the bot if no cache needs to be enabled
    // Otherwise enable the cache
    if (!opts.withCache) return bot;
    bot = enableCachePlugin(bot);
    
    // Return the bot if no sweeper needs to be enabled
    // Otherwise enable the sweeper and return the final bot
    if(!opts.withSweeper) return bot;
    enableCacheSweepers(bot as BotWithCache);
    return bot;
  }
}
