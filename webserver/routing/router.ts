import { readerFromStreamReader } from "https://deno.land/std@0.126.0/io/mod.ts";
import { pathToRegexp } from "../pathToRegexp.ts";

interface Route {
  path: string;
  controller: string;
  action: string;
  method: string;
}

export interface RouteArgs {
  route: Route;
  body: string;
  params: any;
  auth?: string;
}

export class Router {
  private static routes: Route[] = [];
  public static getRoutes() { return Router.routes; }

  /**
   * Match the controller and action to a route
   *
   * @param request
   */
  public async route(request: Request) {
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
    for await(let route of Router.routes) {
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
   * @param args
   * @returns Promise<Response|null>
   */
  public async execute(args: RouteArgs): Promise<Response|null> {
    // Make sure a route was specified
    if(args.route === null) return null;

    // Import the controller file
    const imported = await import(`file://${Deno.cwd()}/src/controller/${args.route.controller[0].toLowerCase() + args.route.controller.slice(1)}.controller.ts`);

    // Instantiate the controller
    const controller = new imported[`${args.route.controller}Controller`](args.route.controller, args.route.action);

    // Execute our action
    await controller[args.route.action](args);

    // Render the body
    await controller.render();

    // Return our response
    return controller.response();
  }

  /**
   * Get the parameters for the given route
   *
   * @param route
   * @param path
   * @returns Promise<{ [key: string]: string }>
   */
  public async getParams(route: Route, path: string): Promise<{ [key: string]: string }> {
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
    const header = request.headers.get("authorization");
    return header ?? '';
  }

  /**
   * Add a route
   *
   * @param route
   * @returns void
   */
  public static add(route: Route): void {
    Router.routes.push(route);
  }
}
