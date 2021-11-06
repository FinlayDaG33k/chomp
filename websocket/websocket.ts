import { WebSocketServer, WebSocketAcceptedClient } from "https://deno.land/x/websocket@v0.1.1/mod.ts";
import { Logger } from "../logging/logger.ts";
import { Events } from "./events.ts";

export class Websocket {
  private port = 80;
  private server: WebSocketServer|null = null;

  constructor(port: number = 80) {
    this.port = port;
  }

  public start() {
    this.server = new WebSocketServer(this.port, Deno.env.get('REAL_IP_HEADER') ?? null);
    this.server.on("connection", (client: WebSocketAcceptedClient) => {
      Logger.info(`New WebSocket connection from "${(client.webSocket.conn.remoteAddr as Deno.NetAddr).hostname!}"...`);
      this.handleEvent('connect', {});

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
      Logger.error(e.message);
    }
  }
}
