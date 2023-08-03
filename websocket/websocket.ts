import { WebSocketServer, WebSocketAcceptedClient } from "https://deno.land/x/websocket@v0.1.3/mod.ts";
import { Logger } from "../logging/logger.ts";
import { Events } from "./events.ts";
import { Authenticator } from "./authenticator.ts";
import { Configure } from "../core/configure.ts";

export class Websocket {
  private readonly port: number = 80;
  private readonly authenticate: boolean = false;
  private server: WebSocketServer|null = null;

  constructor(port: number = 80, authenticate: boolean = false) {
    this.port = port;
    this.authenticate = authenticate;
  }

  public start() {
    this.server = new WebSocketServer(this.port, Configure.get('real_ip_header', 'X-Forwarded-For') ?? null);
    this.server.on("connection", (client: WebSocketAcceptedClient, url: string) => {
      Logger.info(`New WebSocket connection from "${(client.webSocket.conn.remoteAddr as Deno.NetAddr).hostname!}"...`);

      // Authenticate if required
      if(this.authenticate === true && !Authenticator.client(url.replace('/', ''))) {
        Logger.warning(`Closing connection with "${(client.webSocket.conn.remoteAddr as Deno.NetAddr).hostname!}": Invalid token!`);
        client.close(1000, 'Invalid authentication token!');
        return;
      }

      // Dispatch "ClientConnect" event
      this.handleEvent('ClientConnect', {client: client});

      client.on("message", (message: string) => this.onMessage(message));
    });
  }

  public async broadcast(eventString: string, data: any) {
    // Make sure the server has started
    if(!this.server) return;

    // Loop over each client
    // Check whether they are still alive
    // Send the event to the clients that are still alive
    for(let client of this.server.clients) {
      if(!client) continue;
      if(client.isClosed) continue;
      client.send(JSON.stringify({
        event: eventString,
        data: data
      }));
    }
  }

  private async onMessage(message: string) {
    // Check if a message was set
    if(!message) return;

    // Decode the message
    let data = JSON.parse(message);
    // Get the Event
    let event = data.event;
    let tokens = [];
    for(let token of event.split('_')) {
      token = token.toLowerCase();
      token = token[0].toUpperCase() + token.slice(1);
      tokens.push(token);
    }
    event = tokens.join('');

    try {
      await this.handleEvent(event, data.data);
    } catch(e) {
      Logger.error(e.message);
    }
  }

  private async handleEvent(event: string, data: any = []) {
    const handler = Events.getHandler(event);
    if(!handler) return Logger.warning(`Event "${event}" does not exists! (did you register it?)`);

    // Import the event handler
    const imported = await import(`file://${Deno.cwd()}/src/events/${handler.handler}.ts`);

    // Instantiate the event handler
    const controller = new imported[`${event}Event`]();

    // Execute the event handler's execute method
    try {
      await controller['execute'](data);
    } catch(e) {
      Logger.error(`Could not dispatch event "${event}": "${e.message}"`, e.stack);
    }
  }
}
