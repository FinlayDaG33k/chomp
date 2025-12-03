import { HandlebarsCacheItem, ViewVariables } from "../../types/webserver.ts";
import { default as hbs } from "https://jspm.dev/handlebars@4.7.6";
import { Cache } from "../../core/cache.ts";

export class Handlebars {

  /**
   * Render the Handlebars template
   *
   * @param path
   * @param vars
   * @param expiry Time to cache the rendered template. Use null to cache indefinitely.
   */
  public static async render(
    path: string,
    vars: ViewVariables = new Map<string, string | number | unknown>(),
    expiry: string|null = "+1 hour",
  ): Promise<string | null> {
    // Load and compile template
    const template = await Handlebars._compileTemplate(path, expiry);

    // Render template with our view vars
    return template(vars);
  }

  public static async _compileTemplate(path: string, expiry: string|null = "+1 hour") {
    // Build Cache key
    const key = `Webserver.Rendered.Handlebars "${path}"`;

    // Check if we have a cached version
    // Return it if we do
    const inCache = Cache.exists(key);
    const isValid = !Cache.expired(key);
    if(inCache && isValid) return Cache.get(key);

    // Load our template
    const template = await Handlebars._getTemplate(path);

    // Compile our template
    // TODO: Fix type
    // @ts-ignore See TODO
    const compiled = hbs.compile(template);

    // Cache template
    Cache.set(key, compiled, expiry)

    // Return compiled template
    return compiled;
  }

  private static async _getTemplate(path: string): Promise<string> {
    // Make sure out template exists
    try {
      await Deno.stat(path);
    } catch (e) {
      throw new Error(`Could not render handlebars template: Could not read template at "${path}"`, e.stack);
    }

    // Read and our template
    return await Deno.readTextFile(path);
  }
}
