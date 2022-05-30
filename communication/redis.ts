import { redisConnect } from "../deps.ts";
import { Logger } from "../logging/logger.ts";

export class Redis {
  private static connection: any = null;

  /**
   * Connect to a Redis node
   *
   * @param hostname
   * @param port
   * @returns Promise<void>
   */
  public static async connect(hostname = '127.0.0.1', port = 6379): Promise<void> {
    Redis.connection = await redisConnect({
      hostname: hostname,
      port: port
    });
  }

  /**
   * Return the redis connection
   * TODO: Find out type of Redis.connection
   *
   * @return any
   */
  public static getConnection(): any {
    if(!Redis.connection) Logger.error(`Redis connection requested before connecting!`);
    return Redis.connection;
  }
}
