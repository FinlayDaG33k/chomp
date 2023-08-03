import { default as hbs } from "https://jspm.dev/handlebars@4.7.6";
import { Logger } from "../../logging/logger.ts";
import { raise } from "../../utility/raise.ts";
import { ViewVariable } from "../controller/controller.ts";

interface CacheItem {
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
    if(cache) if(cache) Handlebars._cache[path] = compiled;

    // Let the engine render
    return compiled(vars);
  }
  
  private static async getTemplate(path: string): Promise<string|void> {
    // Make sure out template exists
    try {
      await Deno.stat(path);
    } catch(e) {
      Logger.error(`Could not render handlebars template: Could not read template at "${path}"`, e.stack);
      return;
    }

    // Read our template
    const template = await Deno.readTextFile(path);
    
    // Return the template
    return template;
  }
}
