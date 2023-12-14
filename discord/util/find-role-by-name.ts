import { Cache } from "../../core/cache.ts";
import { Discord, Role } from "../discord.ts";
import { Logger } from "../../logging/logger.ts";
import empty from "../../utility/empty.ts";

/**
 * Find a role by its name rather than ID
 *
 * @param guild
 * @param roleName
 * @param expiry Expiry time. Pass null to disable caching.
 * @returns Promise<unknown>
 */
export async function findRoleByName(guild: BigInt, roleName: string, expiry: string|null = `+1 hour`): Promise<Role|null> {
  if(!empty(expiry) && !Cache.expired(`role name ${roleName}`)) {
    return Cache.get(`role name ${roleName}`) as Role;
  }
  
  // Get a list of all roles for the guild
  const roles = Discord.getBot().roles
    ?? await Discord.getBot().helpers.getRoles(guild);
  if(!roles) {
    Logger.error(`Could not obtain roles for guild! (this is a bug!)`);
    return null;
  }

  // Find role by name
  const role = roles.find((role: Role): boolean => role.name === roleName);
  
  // Check if a role was found
  // Return result
  if(!role) {
    Logger.error(`No role with name "${roleName}" could be found! (did you set it up yet?)`);
    return null;
  }
  
  // Set the cache
  if(!empty(expiry)) Cache.set(`role name ${roleName}`, role, expiry);
  return role;
}
