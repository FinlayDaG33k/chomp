import { readerFromStreamReader } from "https://deno.land/std@0.126.0/io/mod.ts";
import { pathToRegexp } from "../pathToRegexp.ts";
import { Inflector } from "../../util/inflector.ts";
import { Logger } from "../../logging/logger.ts";
import { Request as ChompRequest, RequestParameters } from "../http/request.ts";
import { StatusCodes } from "../http/status-codes.ts";
import { Route as ChompRoute } from "./route.ts";
import { Controller } from "../controller/controller.ts";
import { raise } from "../../util/raise.ts";

interface RouteCache {
  [key: string]: Module;
}

interface Route {
  path: string;
  controller: string;
  action: string;
  method?: string;
}

export interface RouteArgs {
  route: ChompRoute;
  body: string;
  params: { [key: string]: string; };
  auth?: string;
}

export class Router {
  private static readonly _controllerDir = `file://${Deno.cwd()}/src/controller`;
  private static routes: ChompRoute[] = [];
  public static getRoutes() { return Router.routes; }
  private static _cache: RouteCache = <RouteCache>{};

  /**
   * Match the controller and action to a route
   *
   * @param request
   */
  public route(request: Request) {
    // Get the request path minus the domain
    const host = request.headers.get("host");
    let path = request.url
      .replace("http://", "")
      .replace("https://", "");
    if(host !== null) path = path.replace(host, "");

    // Loop over each route
    // Check if it is the right method
    // Check if it's the right path
    // Return the route if route found
    for (const route of Router.routes) {
      if(route.getMethod() !== request.method) continue;

      // Make sure we have a matching route
      const matches = pathToRegexp(route.getPath()).exec(path);
      if(matches) return {
        route: route,
        path: path
      };
    }
  }

  /**
   * Execute the requested controller action
   *
   * @param request
   * @returns Promise<Response|null>
   */
  public async execute(request: Request): Promise<Response> {
    // Make sure a route was found
    // Otherwise return a 404 response
    const route = this.route(request);
    if(!route || !route.route) {
      return new Response(
        'The requested page could not be found.',
        {
          status: StatusCodes.NOT_FOUND,
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );
    }
    
    // Build our Request object
    const req = new ChompRequest(
      route.route,
      await this.getBody(request),
      await this.getParams(route.route, route.path),
      this.getAuth(request),
    );

    // Import and cache controller file if need be
    if(!(req.getRoute().getController() in Router._cache)) {
      try {
        // Import the module
        const module = await import(`${Router._controllerDir}/${Inflector.lcfirst(req.getRoute().getController())}.controller.ts`);
        
        // Make sure the controller class was found
        if(!(`${req.getRoute().getController()}Controller` in module)) {
          raise(`No class "${req.getRoute().getController()}Controller" could be found.`);
        }
        
        // Make sure the controller class extends our base controller
        if(!(module[`${req.getRoute().getController()}Controller`].prototype instanceof Controller)) {
          raise(`Class "${req.getRoute().getController()}Controller" does not properly extend our controller.`);
        }
        
        // Add the module to our cache
        Router._cache[req.getRoute().getController()] = module;
      } catch(e) {
        Logger.error(`Could not import "${req.getRoute().getController()}": ${e.message}`, e.stack);
        return new Response(
          'Internal Server Error',
          {
            status: 500,
            headers: {
              'content-type': 'text/plain'
            }
          }
        );
      }
    }
    
    // Run our controller
    try {
      // Instantiate the controller
      const controller = new Router._cache[req.getRoute().getController()][`${req.getRoute().getController()}Controller`](req);

      // Execute our action
      await controller[req.getRoute().getAction()]();

      // Render the body
      await controller.render();

      // Return our response
      return controller.getResponse().build();
    } catch(e) {
      Logger.error(`Could not execute "${req.getRoute().getController()}": ${e.message}`, e.stack);
      return new Response(
        'An Internal Server Error Occurred',
        {
          status: 500,
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );
    }
  }

  /**
   * Get the parameters for the given route
   *
   * @param route
   * @param path
   * @returns Promise<{ [key: string]: string }>
   */
  public async getParams(route: ChompRoute, path: string): Promise<RequestParameters> {
    const keys: any[] = [];
    const r = pathToRegexp(route.getPath(), keys).exec(path) || [];

    return keys.reduce((acc, key, i) => ({ [key.name]: r[i + 1], ...acc }), {});
  }

  /**
   * Get the body from the request
   *
   * @param request
   * @returns Promise<string>
   */
  public async getBody(request: Request): Promise<string> {
    // Make sure a body is set
    if(request.body === null) return '';

    // Create a reader
    const reader = readerFromStreamReader(request.body.getReader());

    // Read all bytes
    const buf: Uint8Array = await Deno.readAll(reader);

    // Decode and return
    return new TextDecoder("utf-8").decode(buf);
  }

  /**
   * Check if there is an authorization header set, return it if so
   *
   * @param request
   * @returns string
   */
  public getAuth(request: Request): string {
    // Get our authorization header
    // Return it or empty string if none found
    return request.headers.get("authorization") ?? '';
  }

  /**
   * Add a route.
   * Defaults to 'GET'
   *
   * @param route
   * @returns void
   */
  public static add(route: Route): void {
    Router.routes.push(new ChompRoute(
      route.path,
      Inflector.pascalize(route.controller),
      route.action,
      route.method ?? 'GET',
    ));
  }
}
