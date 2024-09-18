import { Logger } from "../core/logger.ts";
import { File } from "../filesystem/file.ts";

export interface ExclusionConfig {
  directories?: string[];
  files?: string[];
}

/**
 * Check all files in the specified directories.
 * Doing this allows the program to start up significantly faster after deployment.
 * It is **NOT** a replacement for "deno lint".
 *
 * @example Basic Usage
 * ```ts
 * import { CheckSource } from "https://deno.land/x/chomp/utility/check-source.ts";
 *
 * const checker = new CheckSource(['./src']);
 * await checker.run();
 * ```
 *
 * @example Exclude a directory
 * ```ts
 * import { CheckSource } from "https://deno.land/x/chomp/utility/check-source.ts";
 *
 * const checker = new CheckSource(['./src'], { directories: 'my-directory' });
 * await checker.run();
 * ```
 *
 * @example Exclude a file
 * ```ts
 * import { CheckSource } from "https://deno.land/x/chomp/utility/check-source.ts";
 *
 * const checker = new CheckSource(['./src'], { files: './src/my-directory/my-file.txt' });
 * await checker.run();
 * ```
 */
export class CheckSource {
  private files: string[] = [];
  private errors = 0;

  constructor(
    private readonly paths: string[],
    private readonly exclusions: ExclusionConfig = { directories: [], files: [] }
  ) {}

  public async run(): Promise<void> {
    // Get all files in all paths
    for(const path of this.paths) {
      await this.getFiles(path);
    }

    // Check all files found
    Logger.info(`Checking "${this.files.length}" files...`);
    await this.checkFiles();

    // Exit when done
    if(this.errors > 0) {
      Logger.info(`Finished checking files with ${this.errors} errors!\r\nPlease check the logs above for more information.`);
      Deno.exit(1);
    }
    Logger.info(`Finished checking files without errors!`);
    Deno.exit(0);
  }

  /**
   * Recursively can all files in the given path
   * Ignore directories and files given in our exclusions
   *
   * @param path
   */
  private async getFiles(path: string) {
    Logger.info(`Getting all files in directory "${path}"...`);
    for await(const entry of Deno.readDir(path)) {
      if(entry.isDirectory) {
        if('directories' in this.exclusions && this.exclusions.directories?.includes(entry.name)) {
          Logger.debug(`Skipping excluded directory "${path}/${entry.name}"...`);
          continue;
        }
        await this.getFiles(`${path}/${entry.name}`);
      }

      if(entry.isFile) {
        if('files' in this.exclusions && this.exclusions.files?.includes(entry.name)) {
          Logger.debug(`Skipping excluded file "${path}/${entry.name}"...`);
          continue;
        }
        if(new File(`${path}/${entry.name}`).ext() !== 'ts') {
          Logger.debug(`Skipping non-ts file...`);
          continue;
        }
        Logger.debug(`Found file "${path}/${entry.name}"...`);
        this.addFile(`${path}/${entry.name}`);
      }
    }
  }

  /**
   * Add file to array of files
   *
   * @param path
   */
  private addFile(path: string) {
    if(this.files.includes(path)) return;
    this.files.push(path);
  }

  /**
   * Check all files found
   */
  private async checkFiles() {
    for await(const file of this.files) {
      try {
        await import(`file://${Deno.cwd()}/${file}`);
      } catch(e) {
        Logger.error(`Check for "${Deno.cwd()}/${file}" failed: ${e.message}`, e.stack);
        this.errors++;
      }
    }
  }
}
