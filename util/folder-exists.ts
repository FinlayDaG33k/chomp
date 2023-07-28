export async function folderExists(path: string): Promise<boolean> {
  try {
    const target = await Deno.stat(path);
    return target.isDirectory;
  } catch(e) {
    if(e instanceof Deno.errors.NotFound) return false;
    throw e;
  }
}
