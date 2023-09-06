import { readerFromStreamReader } from "https://deno.land/std@0.126.0/io/mod.ts";
import { pathToRegexp } from "../pathToRegexp.ts";
import { Inflector } from "../../utility/inflector.ts";
import { Logger } from "../../logging/logger.ts";
import {QueryParameters, Request as ChompRequest, RequestParameters} from "../http/request.ts";
import { StatusCodes } from "../http/status-codes.ts";
import { Route as ChompRoute } from "./route.ts";
import { Controller } from "../controller/controller.ts";
import { Registry } from "../registry/registry.ts";
import { raise } from "../../utility/raise.ts";

interface Route {
  path: string;
  controller: string;
  action: string;
  method?: string;
}

export class Router {
  private static readonly _controllerDir = `file://${Deno.cwd()}/src/controller`;
  private static routes: ChompRoute[] = [];
  public static getRoutes() { return Router.routes; }

  /**
   * Match the controller and action to a route
   *
   * @param request
   */
  public static route(request: Request) {
    // Get the request path minus the domain
    const host = request.headers.get("host");
    let path = request.url
      .replace("http://", "")
      .replace("https://", "");
    if(host !== null) path = path.replace(host, "");
    
    // Escape query params
    path = path.replace("?", "%3F");

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
   * @param clientIp
   * @returns Promise<Response|null>
   */
  public static async execute(request: Request, clientIp: string): Promise<Response> {
    // Make sure a route was found
    // Otherwise return a 404 response
    const route = Router.route(request);
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
      request.url,
      request.method,
      route.route,
      request.headers,
      await Router.getBody(request),
      await Router.getParams(route.route, route.path),
      await Router.getQuery(route.path),
      Router.getAuth(request),
      clientIp
    );

    // Import and cache controller file if need be
    if(!Registry.has(req.getRoute().getController())) {
      try {
        // Import the module
        const module = await import(`${Router._controllerDir}/${Inflector.lcfirst(req.getRoute().getController())}.controller.ts`);
        
        // Make sure the controller class was found
        if(!(`${req.getRoute().getController()}Controller` in module)) {
          raise(`No class "${req.getRoute().getController()}Controller" could be found.`);
        }
        
        // Make sure the controller class extends our base controller
        if(!(module[`${req.getRoute().getController()}Controller`].prototype instanceof Controller)) {
          raise(`Class "${req.getRoute().getController()}Controller" does not properly extend Chomp's controller.`);
        }
        
        // Add the module to our registry
        Registry.add(`${req.getRoute().getController()}Controller`, module);
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
      const module = Registry.get(`${req.getRoute().getController()}Controller`) ?? raise(`"${req.getRoute().getController()}Controller" was not found in registry.`)
      const controller = new module[`${req.getRoute().getController()}Controller`](req);

      // Run the controller's initializer
      await controller.initialize();
      
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
  public static async getParams(route: ChompRoute, path: string): Promise<RequestParameters> {
    // Strip off query parameters
    path = path.split("%3F");
    path = path[0];
    
    const keys: any[] = [];
    const r = pathToRegexp(route.getPath(), keys).exec(path) || [];

    return keys.reduce((acc, key, i) => ({ [key.name]: r[i + 1], ...acc }), {});
  }

  /**
   * Get the query parameters for the given route
   * 
   * @param path
   * @returns Promise<QueryParameters>
   */
  public static async getQuery(path: string): Promise<QueryParameters> {
    path = path.split("%3F");
    path = path[1];
    const params = new URLSearchParams(path);
    return Object.fromEntries(params.entries());
  }
  
  /**
   * Get the body from the request
   *
   * @param request
   * @returns Promise<string>
   */
  public static async getBody(request: Request): Promise<string> {
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
  public static getAuth(request: Request): string {
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
