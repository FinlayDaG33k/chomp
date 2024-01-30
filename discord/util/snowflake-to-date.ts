import { DISCORD_EPOCH } from "../mod.ts";

/**
 * Turn a Discord snowflake into a date object.
 * Source: https://discord.com/developers/docs/reference#snowflake-ids-in-pagination
 *
 * @param snowflake
 * @param epoch
 */
export function snowflakeToDate(snowflake: bigint, epoch: number = DISCORD_EPOCH): Date {
  return new Date(Number(snowflake >> 22n) + epoch);
}
