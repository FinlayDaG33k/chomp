import { Logger } from "../logging/logger.ts";
import { Router } from "./routing/router.ts";

export class Webserver {
  private server: any = null;
  private port: number = 0;
  private router: Router = new Router();

  constructor(port: number = 80) {
    this.port = port;
  }

  public async start() {
    // Start listening
    this.server = Deno.listen({ port: this.port });

    // Serve connections
    for await (const conn of this.server) {
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
        const routing = await this.router.route(request.request);
        if(!routing || !routing.route) {
          return new Response(
            'The requested page could not be found.',
            {
              status: 404,
              headers: {
                'content-type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }
        const response = await this.router.execute({
          route: routing.route,
          body: await this.router.getBody(request.request),
          params: await this.router.getParams(routing.route, routing.path ?? '/'),
          auth: this.router.getAuth(request.request)
        });
        if(!response) throw Error('Response was empty');
        await request.respondWith(response);
      } catch(e) {
        Logger.error(`Could not serve response: ${e.message}`, e.stack);
        await request.respondWith(new Response('Internal server error', {status: 500}));
      }
    }
  }
}
