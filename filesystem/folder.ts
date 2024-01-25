import { Logger } from "../logging/logger.ts";

export class Folder {
  public constructor(
    private readonly path: string
  ) {
  }

  /**
   * Check whether the folder exists at the path.
   */
  public async exists(): Promise<boolean> {
    try {
      const target = await Deno.stat(this.path);
      return target.isDirectory;
    } catch(e) {
      if(e instanceof Deno.errors.NotFound) return false;
      throw e;
    }
  }

  /**
   * Create the directory if it does not exist yet.
   * 
   * @param options Options with which to create the directory
   */
  public async create(options?: Deno.MkdirOptions): Promise<void> {
    try {
      if(await this.exists()) throw new Error('The specified folder already exists!');
    } catch(e) {
      Logger.warning(e.message);
    }

    await Deno.mkdir(this.path, options);
  }
}
