import { Route } from "../routing/route.ts";

export interface RequestParameters {
  [name: string]: string;
}

export interface QueryParameters {
  [name: string]: string;
}

export class Request {
  constructor(
    private readonly url: string,
    private readonly method: string,
    private readonly route: Route,
    private readonly headers: Headers,
    private readonly body: string,
    private readonly params: RequestParameters,
    private readonly query: QueryParameters,
    private readonly auth: string,
    private readonly ip: string|null = null,
  ) {
  }
  
  public getUrl(): string { return this.url; }
  
  public getMethod(): string { return this.method; }
  
  public getRoute(): Route { return this.route; }
  
  public getHeaders(): Headers { return this.headers ;}
  
  public getBody(): string { return this.body; }
  
  public getParams(): RequestParameters { return this.params; }
  
  public getParam(name: string): string|null { 
    if(name in this.params) return this.params[name];
    return null;
  }

  public getQueryParams(): QueryParameters { return this.query; }
  
  public getQuery(name: string): string|null {
    if(name in this.query) return this.query[name];
    return null;
  }
  
  public getAuth(): string { return this.auth; }
  
  public getIp(): string|null { return this.ip; }
}
