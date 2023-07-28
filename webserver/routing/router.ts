import { readerFromStreamReader } from "https://deno.land/std@0.126.0/io/mod.ts";
import { pathToRegexp } from "../pathToRegexp.ts";
import { Inflector } from "../../util/inflector.ts";
import { Logger } from "../../logging/logger.ts";
import { Request as ChompRequest, RequestParameters } from "../http/request.ts";
import { StatusCodes } from "../http/status-codes.ts";

export interface Route {
  path: string;
  controller: string;
  action: string;
  method?: string;
}

interface RouteCache {
  [key: string]: Module;
}

export interface RouteArgs {
  route: Route;
  body: string;
  params: { [key: string]: string; };
  auth?: string;
}

export class Router {
  private static readonly _controllerDir = `file://${Deno.cwd()}/src/controller`;
  private static routes: Route[] = [];
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
      if(route.method !== request.method) continue;

      // Make sure we have a matching route
      const matches = pathToRegexp(route.path).exec(path);
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
    if(!(req.route.controller in Router._cache)) {
      try {
        Router._cache[req.route.controller] = await import(`${Router._controllerDir}/${Inflector.lcfirst(req.route.controller)}.controller.ts`);
      } catch(e) {
        Logger.error(`Could not import "${req.route.controller}": ${e.message}`, e.stack);
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
      const controller = new Router._cache[req.route.controller][`${req.route.controller}Controller`](req);

      // Execute our action
      await controller[req.route.action]();

      // Render the body
      await controller.render();

      // Return our response
      return controller.response.build();
    } catch(e) {
      Logger.error(`Could not execute "${req.route.controller}": ${e.message}`, e.stack);
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
  public async getParams(route: Route, path: string): Promise<RequestParameters> {
    const keys: any[] = [];
    const r = pathToRegexp(route.path, keys).exec(path) || [];

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
    // Check if a method was set, use default if not
    if(!('method' in route)) route.method = 'GET';
    
    // Pascalize the controller
    route.controller = Inflector.pascalize(route.controller);
    
    // Add the route to our routes
    Router.routes.push(route);
  }
}
