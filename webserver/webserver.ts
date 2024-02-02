import { Logger } from "../logging/logger.ts";
import { Router } from "./routing/router.ts";
import { StatusCodes } from "./http/status-codes.ts";

export class Webserver {
  private server: Deno.Listener|null = null;

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
    // deno-lint-ignore no-deprecated-deno-api -- TODO
    const httpConn: Deno.HttpConn = Deno.serveHttp(conn);

    // Handle each request for this connection
    for await(const request of httpConn) {
      Logger.debug(`Request from "${(conn.remoteAddr as Deno.NetAddr).hostname!}:${(conn.remoteAddr as Deno.NetAddr).port!}": ${request.request.method} | ${request.request.url}`);
      try {
        // Run the required route
        const response: Response = await Router.execute(request.request, (conn.remoteAddr as Deno.NetAddr).hostname!);
        
        // Send our response
        await request.respondWith(response);
      } catch(e) {
        Logger.error(`Could not serve response: ${e.message}`, e.stack);
        await request.respondWith(new Response(
          'An Internal Server Error Occurred',
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        ));
      }
    }
  }
}
