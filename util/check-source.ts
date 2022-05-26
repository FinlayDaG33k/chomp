import { Logger } from "../logging/logger.ts";

export interface ExclusionConfig {
  directories?: string[];
  files?: string[];
}

export class CheckSource {
  private files: string[] = [];

  constructor(
    private readonly path: string,
    private readonly exclusions: ExclusionConfig[] = []
  ) {}

  public async run(): Promise<void> {
    // Get list of files
    await this.getFiles(this.path);

    // Checkk all files found
    Logger.info(`Checking "${this.files.length}" files...`);
    await this.checkFiles();

    // Exit when done
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
        if(this.exclusions.directories !== null && this.exclusions.directories.includes(entry.name)) {
          Logger.debug(`Skipping excluded directory "${path}/${entry.name}"...`);
          continue;
        }
        this.getFiles(`${path}/${entry.name}`);
      }

      if(entry.isFile) {
        if(this.exclusions.files !== null && this.exclusions.files.includes(entry.name)) {
          Logger.debug(`Skipping excluded file "${path}/${entry.name}"...`);
          continue;
        }
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

  private async checkFiles() {
    for await(const file of this.files) {
      await import(`file://${Deno.cwd()}/${file}`);
    }
  }
}
