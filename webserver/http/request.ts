import { Route } from "../routing/route.ts";

export interface RequestParameters {
  [name: string]: string;
}

export class Request {
  constructor(
    private readonly url: string,
    private readonly method: string,
    private readonly route: Route,
    private readonly body: string,
    private readonly params: RequestParameters,
    private readonly auth: string,
    private readonly ip: string|null = null,
  ) {
  }
  
  public getUrl(): typeof this.url { return this.url; }
  
  public getMethod(): typeof this.method { return this.method; }
  
  public getRoute(): typeof this.route { return this.route; }
  
  public getBody(): typeof this.body { return this.body; }
  
  public getParams(): typeof this.params { return this.params; }
  
  public getParam(name: string): string|null { 
    if(name in this.params) return this.params[name];
    return null;
  }
  
  public getAuth(): typeof this.auth { return this.auth; }
  
  public getIp(): typeof this.ip { return this.ip; }
}
