import { createBot, startBot } from "https://deno.land/x/discordeno@13.0.0/mod.ts";
import { enableCachePlugin, enableCacheSweepers } from "https://deno.land/x/discordeno@13.0.0/plugins/cache/mod.ts";
import { EventDispatcher } from "./event-dispatcher.ts";
import { Logger } from "../logging/logger.ts";

export * from "https://deno.land/x/discordeno@13.0.0/mod.ts";

export interface DiscordInitOpts {
  token: string;
  intents: any[];
  botId: bigint|number;
  withCache?: boolean;
}

export class Discord {
  protected static bot: any;
  protected token = '';
  protected intents: any;
  protected botId = BigInt(0);

  /**
   * Return the instance of the Discord bot connection
   * TODO: Find out type of Discord.bot
   *
   * @returns any
   */
  public static getBot(): any { return Discord.bot; }

  public constructor(opts: DiscordInitOpts) {
    // Make sure required parameters are present
    if('token' in opts) {
      this.token = opts.token;
    } else {
      Logger.error('No Discord bot token was provided!');
      Deno.exit(1);
    }
    if('intents' in opts) this.intents = opts.intents;
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
        guildLoaded(_bot, data) {
          EventDispatcher.dispatch('GuildLoaded', data);
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
          EventDispatcher.dispatch('InteractionCreate', guild);
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
          // Remapped to "MessageReactionRemoveAll"
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
        voiceChannelLeave(_bot, voiceState, guild, channel) {
          EventDispatcher.dispatch('VoiceChannelLeave', { voiceState: voiceState, guild: guild, channel: channel });
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
    if(opts.withCache === true) {
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
