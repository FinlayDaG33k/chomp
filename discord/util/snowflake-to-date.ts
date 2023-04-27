export const DISCORD_EPOCH = 1420070400000;

/**
 * Turn a Discord snowflake into a date object.
 * Source: https://discord.com/developers/docs/reference#snowflake-ids-in-pagination
 *
 * @param snowflake
 * @param epoch
 */
export function snowflakeToDate(snowflake: any, epoch: number = DISCORD_EPOCH): Date {
  const milliseconds = BigInt(snowflake) >> 22n;
  return new Date(Number(milliseconds) + epoch);
}
