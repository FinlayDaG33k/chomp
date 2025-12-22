import { RequestParameters, QueryParameters } from "../../types/webserver.ts";
import { Route } from "../routing/route.ts";
import {valueOrDefault} from "../../utility/value-or-default.ts";

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
    private readonly ip: string | null = null,
  ) {
  }

  public getUrl(): string {
    return this.url;
  }

  public getMethod(): string {
    return this.method;
  }

  public getRoute(): Route {
    return this.route;
  }

  public getHeaders(): Headers {
    return this.headers;
  }

  public getBody(): string {
    return this.body;
  }

  public getParams(): RequestParameters {
    return this.params;
  }

  public getParam(name: string): string | null {
    return valueOrDefault<string|null>(this.params[name], null);
  }

  public getQueryParams(): QueryParameters {
    return this.query;
  }

  public getQuery(name: string): string | null {
    return valueOrDefault<string|null>(this.query[name], null);
  }

  public getAuth(): string {
    return this.auth;
  }

  public getIp(): string | null {
    return this.ip;
  }
}
