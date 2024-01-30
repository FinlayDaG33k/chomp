import { default as hbs } from "https://jspm.dev/handlebars@4.7.6";
import { raise } from "../../error/raise.ts";
import { ViewVariable } from "../controller/controller.ts";

interface CacheItem {
  // deno-lint-ignore ban-types -- TODO
  [key: string]: Function;
}

export class Handlebars {
  private static _cache: CacheItem = <CacheItem>{};
  
  public static async render(path: string, vars: ViewVariable = <ViewVariable>{}, cache = true): Promise<string|void> {
    // Read and execute from cache if possible
    if(cache && path in Handlebars._cache) return Handlebars._cache[path](vars);
    
    // Load our template
    const template = await Handlebars.getTemplate(path) ?? raise('Could not load template');
    
    // Compile our template
    // Cache it if need be
    const compiled = hbs.compile(template) ?? raise('Could not compile template');
    if(cache) Handlebars._cache[path] = compiled;

    // Let the engine render
    return compiled(vars);
  }
  
  private static async getTemplate(path: string): Promise<string> {
    // Make sure out template exists
    try {
      await Deno.stat(path);
    } catch(e) {
      throw new Error(`Could not render handlebars template: Could not read template at "${path}"`, e.stack);
    }

    // Read and our template
    return await Deno.readTextFile(path);
  }
}
