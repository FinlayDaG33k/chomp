import { Discord } from "../discord.ts";
import { Logger } from "../../logging/logger.ts";

/**
 * Find a channel by its name rather than ID
 * TODO: (1) Create a Map that maps channel names and snowflakes together (updates on event by gateway)
 * TODO: (2) Lookup channel name in new map (acts as cache)
 * TODO: (3) Obtain channel from channels list directly
 *
 * @param guild
 * @param name
 */
export async function findChannelByName(guild: BigInt, name: string): Promise<unknown> {
  const channels = await Discord.getBot().helpers.getChannels(guild);
  if(!channels) {
    Logger.error(`Could not obtain channels for guild! (this is a bug!)`);
    return null;
  }

  const channel = channels.find((channel: any) => channel.name === name.toLowerCase());
  if(!channel) {
    Logger.error(`No channel with name "#${name}" could be found! (did you set it up yet?)`);
    return null;
  }

  return channel;
}
