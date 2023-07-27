import { Logger } from "../logging/logger.ts";
import { Router } from "./routing/router.ts";

export class Webserver {
  private server: any = null;
  private router: Router = new Router();

  constructor(
    private readonly port: number = 80
  ) {
  }

  public async start() {
    // Start listening
    this.server = Deno.listen({ port: this.port });

    // Serve connections
    for await (const conn of this.server) {
      // @ts-ignore Left intentionally without await
      this.serve(conn);
    }
  }

  private async serve(conn: Deno.Conn) {
    // Upgrade the connection to HTTP
    const httpConn: Deno.HttpConn = Deno.serveHttp(conn);

    // Handle each request for this connection
    for await(const request of httpConn) {
      Logger.debug(`Request from "${(conn.remoteAddr as Deno.NetAddr).hostname!}:${(conn.remoteAddr as Deno.NetAddr).port!}": ${request.request.method} | ${request.request.url}`);
      try {
        // Try to find a matching route
        // Respond with 404 if not found
        const routing = this.router.route(request.request);
        if(!routing || !routing.route) {
          await request.respondWith(new Response(
            'The requested page could not be found.',
            {
              status: 404,
              headers: {
                'content-type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
              }
            }
          ));
          return;
        }
        
        // Execute the route
        const response = await this.router.execute({
          route: routing.route,
          body: await this.router.getBody(request.request),
          params: await this.router.getParams(routing.route, routing.path ?? '/'),
          auth: this.router.getAuth(request.request)
        });
        
        // Check if the response was empty or not
        if(!response) throw Error('Response was empty');
        
        // Send our response
        await request.respondWith(response);
      } catch(e) {
        Logger.error(`Could not serve response: ${e.message}`, e.stack);
        await request.respondWith(new Response('Internal server error', {status: 500}));
      }
    }
  }
}
