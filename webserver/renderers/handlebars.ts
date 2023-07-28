import { handlebarsEngine } from "https://raw.githubusercontent.com/FinlayDaG33k/view-engine/patch-1/mod.ts";
import { Logger } from "../../logging/logger.ts";
import { raise } from "../../util/raise.ts";
import { ViewVariable } from "../controller/controller.ts";

interface CacheItem {
  [key: string]: string;
}

export class Handlebars {
  private static _cache: CacheItem = <CacheItem>{};
  
  public static async render(path: string, vars: ViewVariable = <ViewVariable>{}, cache = true): Promise<string|void> {
    // Load our template
    const template = await Handlebars.getTemplate(path, cache) ?? raise('Could not load template');

    // Let the engine render
    return handlebarsEngine(template, vars);
  }
  
  private static async getTemplate(path: string, cache: boolean): Promise<string|void> {
    // Read template from cache if possible
    if(cache && path in Handlebars._cache) return Handlebars._cache[path];
    
    // Make sure out template exists
    try {
      await Deno.stat(path);
    } catch(e) {
      Logger.error(`Could not render handlebars template: Could not read template at "${path}"`, e.stack);
      return;
    }

    // Read our template
    const template = await Deno.readTextFile(path);
    
    // Write to cache if need be
    if(cache) Handlebars._cache[path] = template;
    
    // Return the template
    return template;
  }
}
