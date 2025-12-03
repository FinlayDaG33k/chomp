import { connect as redisConnect, Redis as RedisConn } from "https://deno.land/x/redis@v0.25.2/mod.ts";
import { Logger } from "../core/logger.ts";

/**
 * Interact with {@link https://redis.io/ Redis} using the {@link https://deno.land/x/redis@v0.25.2/mod.ts Redis library}.
 *
 * @deprecated No longer actively maintained
 */
export class Redis {
  private static connection: RedisConn | null = null;

  /**
   * Connect to a Redis node
   *
   * @param hostname
   * @param port
   * @returns Promise<void>
   */
  public static async connect(hostname = "127.0.0.1", port = 6379): Promise<void> {
    Redis.connection = await redisConnect({
      hostname: hostname,
      port: port,
    });
  }

  /**
   * Return the redis connection
   *
   * @return any
   */
  public static getConnection(): RedisConn {
    if (!Redis.connection) Logger.error(`Redis connection requested before connecting!`);
    return Redis.connection!;
  }
}
