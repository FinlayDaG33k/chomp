import { Logger } from "../logging/logger.ts";
import { File } from "../filesystem/file.ts";

export interface ExclusionConfig {
  directories?: string[];
  files?: string[];
}

export class CheckSource {
  private files: string[] = [];
  private errors = 0;

  constructor(
    private readonly path: string,
    private readonly exclusions: ExclusionConfig = { directories: [], files: [] }
  ) {}

  public async run(): Promise<void> {
    // Get list of files
    await this.getFiles(this.path);

    // Check all files found
    Logger.info(`Checking "${this.files.length}" files...`);
    await this.checkFiles();

    // Exit when done
    if(this.errors > 0) {
      Logger.info(`Finished checking files with ${this.errors} errors!\r\nPlease check the logs above for more information.`);
      Deno.exit(1);
    }
    Logger.info(`Finished checking files!`);
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
