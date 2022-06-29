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

  public async route(request: Request) {
    // Get the request path minus the domain
    let host = request.headers.get("host");
    let path = request.url.replace("http://", "");
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
   *
   * @param args
   */
  public async execute(args: RouteArgs) {
    // Make sure a rout was specified
    if(args.route === null) return;

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

  public async getParams(route: Route, path: string): Promise<{ [key: string]: string }> {
    const keys: any[] = [];
    const r = pathToRegexp(route.path, keys).exec(path) || [];

    return keys.reduce((acc, key, i) => ({ [key.name]: r[i + 1], ...acc }), {});
  }

  public async getBody(request: Request) {
    // Make sure a body is set
    if(request.body === null) return '';

    // Create a reader
    const reader = readerFromStreamReader(request.body.getReader());

    // Read all bytes
    const buf: Uint8Array = await Deno.readAll(reader);

    // Decode and return
    return new TextDecoder("utf-8").decode(buf);
  }

  public async getAuth(request: Request) {
    // Get our authorization header
    // Return it or empty string if none found
    const header = request.headers.get("authorization");
    return header ?? '';
  }

  public static add(route: Route) {
    Router.routes.push(route);
  }
}
