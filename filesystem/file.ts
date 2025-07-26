/**
 * Interact with a file
 *
 * TODO: Finish documentation
 */
export class File {
  public constructor(
    private readonly path: string,
  ) {
  }

  public async exists(): Promise<boolean> {
    try {
      const target = await Deno.stat(this.path);
      return target.isFile;
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) return false;
      throw e;
    }
  }

  public async create(): Promise<void> {
    await Deno.create(this.path);
  }

  public async delete(): Promise<void> {
    await Deno.remove(this.path);
  }

  public async move(path: string): Promise<File|false> {
    try {
      await Deno.rename(this.path, path);
      return new File(path);
    }catch(e) {
      return false;
    }
  }

  public async copy(path: string): Promise<File|false> {
    try {
      await Deno.copyFile(this.path, path);
      return new File(path);
    }catch(e) {
      return false;
    }
  }

  public ext(): string {
    const pos = this.path.lastIndexOf(".");
    if (pos < 1) return "";
    return this.path.slice(pos + 1);
  }

  public readTextFile() {
    return Deno.readTextFile(this.path);
  }

  public readFile() {
    return Deno.readFile(this.path);
  }

  public async writeTextFile(data: string|ReadableStream<string>, options?: Deno.WriteFileOptions) {
    try {
      await Deno.writeTextFile(this.path, data, options);
      return true;
    } catch(e) {
      return false;
    }
  }

  public async writeFile(data: Uint8Array|ReadableStream<Uint8Array>, options?: Deno.WriteFileOptions) {
    try {
      await Deno.writeFile(this.path, data, options);
      return true;
    } catch(e) {
      return false;
    }
  }
}
