import { Logger } from "../logging/logger.ts";

export class NutState {
  public static readonly WAITING = 0;
  public static readonly IDLE = 1;
}

export class Nut {
  private host: string = '';
  private port: number = 3493;
  private client: any = null;
  private _status: number = NutState.IDLE;
  private callback: any = null;
  private dataBuf: string = '';

  public get status(): number { return this._status; }

  constructor(host: string|undefined, port: number = 3493) {
    if(typeof host === 'undefined') {
      Logger.error(`Could not register monitor for "UPS": No NUT host defined!`);
      return this;
    }

    this.host = host;
    this.port = port;
  }

  public async connect() {
    // Instantiate a new client
    this.client = await Deno.connect({ hostname: this.host, port: this.port });

    // Create pseudo-event handler
    this.onReceive();
  }

  public async send(cmd: string, callback: any) {
    if(this._status !== NutState.IDLE) throw new Error(`NUT not ready to send new data yet!`);
    this._status = NutState.WAITING;
    this.callback = callback;

    // Encode our command string
    const data = new TextEncoder().encode(`${cmd}\n`);

    // Send our data over the connection
    await this.client.write(data);
  }

  public async close() {
    //this.send(`LOGOUT`);
    this.client.close();
  }

  private async onReceive() {
    for await (const buffer of Deno.iter(this.client)) {
      this.dataBuf += new TextDecoder().decode(buffer);
      this.callback(this.dataBuf);
    }
  }

  private onError(err: any) {
    console.log(err);
  }

  public getLoad(name: string|undefined): Promise<number> {
    if(typeof name === 'undefined') Promise.reject('UPS name must be specified!');

    return new Promise(async (resolve: any, reject: any) => {
      await this.send(`GET VAR ${name} ups.load`, (data: any) => {
        // Get our power
        const matches = /VAR (?:[a-zA-Z0-9]+) ups\.load "([0-9]+)"/.exec(data);
        if(matches === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        if(typeof matches![1] === 'undefined' || matches![1] === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }

        this._status = NutState.IDLE;
        this.dataBuf = '';
        resolve(Number(matches![1]));
      });
    });
  }

  public getPowerLimit(name: string|undefined): Promise<number> {
    if(typeof name === 'undefined') Promise.reject('UPS name must be specified!');

    return new Promise(async (resolve: any, reject: any) => {
      await this.send(`GET VAR ${name} ups.realpower.nominal`, (data: any) => {
        // Get our power
        const matches = /VAR (?:[a-zA-Z0-9]+) ups\.realpower\.nominal "([0-9]+)"/.exec(data);
        if(matches === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        if(typeof matches![1] === 'undefined' || matches![1] === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        this._status = NutState.IDLE;
        this.dataBuf = '';
        resolve(Number(matches![1]));
      });
    });
  }

  public getCharge(name: string|undefined): Promise<number> {
    if(typeof name === 'undefined') Promise.reject('UPS name must be specified!');

    return new Promise(async (resolve: any, reject: any) => {
      await this.send(`GET VAR ${name} battery.charge`, (data: any) => {
        // Get our power
        const matches = /VAR (?:[a-zA-Z0-9]+) battery\.charge "([0-9]+)"/.exec(data);
        if(matches === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        if(typeof matches![1] === 'undefined' || matches![1] === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        this._status = NutState.IDLE;
        this.dataBuf = '';
        resolve(Number(matches![1]));
      });
    });
  }

  public getRuntime(name: string|undefined): Promise<number> {
    if(typeof name === 'undefined') Promise.reject('UPS name must be specified!');

    return new Promise(async (resolve: any, reject: any) => {
      await this.send(`GET VAR ${name} battery.runtime`, (data: any) => {
        // Get our power
        const matches = /VAR (?:[a-zA-Z0-9]+) battery\.runtime "([0-9]+)"/.exec(data);
        if(matches === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        if(typeof matches![1] === 'undefined' || matches![1] === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        this._status = NutState.IDLE;
        this.dataBuf = '';
        resolve(Number(matches![1]));
      });
    });
  }

  public getStatus(name: string|undefined): Promise<string> {
    if(typeof name === 'undefined') Promise.reject('UPS name must be specified!');

    return new Promise(async (resolve: any, reject: any) => {
      await this.send(`GET VAR ${name} ups.status`, (data: any) => {
        // Get our power
        const matches = /VAR (?:[a-zA-Z0-9]+) ups\.status "([0-9]+)"/.exec(data);
        if(matches === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        if(typeof matches![1] === 'undefined' || matches![1] === null) {
          this._status = NutState.IDLE;
          this.dataBuf = '';
          resolve(0);
          return;
        }
        this._status = NutState.IDLE;
        this.dataBuf = '';
        resolve(Number(matches![1]));
      });
    });
  }

  public get UPSList() {
    return new Promise(async (resolve: any, reject: any) => {
      await this.send(`LIST UPS`, (data: any) => {
        const dataArray = data.split('\n');
        const vars: any = {};
        for (const line of dataArray) {
          // Check if we have an error
          if(line.indexOf('ERR') === 0) {
            this._status = NutState.IDLE;
            this.dataBuf = '';
            reject(line.slice(4));
            return;
          }

          // Find UPS entries by regex
          // Check if 3 items have been found
          // Add them to our object
          if(line.indexOf('UPS ') === 0) {
            const matches = /^UPS\s+(.+)\s+"(.*)"/.exec(line);
            if(matches === null) continue;
            if(matches.length < 3) continue;
            vars[matches[1]] = matches[2];
            continue;
          }

          // Resolve if we hit the end
          if(line.indexOf('END LIST UPS') === 0) {
            this._status = NutState.IDLE;
            this.dataBuf = '';
            resolve(vars);
            return;
          }
        }
      });
    });
  }
}
