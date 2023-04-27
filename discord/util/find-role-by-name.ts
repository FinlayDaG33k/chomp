import { Discord } from "../discord.ts";
import { Logger } from "../../logging/logger.ts";

/**
 * Find a role by its name rather than ID
 * TODO: (1) Create a Map that maps role names and snowflakes together (updates on event by gateway)
 * TODO: (2) Lookup role name in new map (acts as cache)
 * TODO: (3) Obtain role from roles list directly
 * TODO: Find out return type
 *
 * @param guild
 * @param roleName
 * @returns Promise<unknown>
 */
export async function findRoleByName(guild: BigInt, roleName: string): Promise<unknown> {
  // Get a list of all roles for the guild
  const roles = await Discord.getBot().helpers.getRoles(guild);
  if(!roles) {
    Logger.error(`Could not obtain roles for guild! (this is a bug!)`);
    return null;
  }

  // Find role by name
  const role = roles.find((role: unknown) => role.name === roleName);
  
  // Check if a role was found
  // Return result
  if(!role) {
    Logger.error(`No role with name "${roleName}" could be found! (did you set it up yet?)`);
    return null;
  }
  return role;
}
