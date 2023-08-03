export class Folder {
  public constructor(
    private readonly path: string
  ) {
  }
  
  public async exists(): Promise<boolean> {
    try {
      const target = await Deno.stat(this.path);
      return target.isDirectory;
    } catch(e) {
      if(e instanceof Deno.errors.NotFound) return false;
      throw e;
    }
  }
}
