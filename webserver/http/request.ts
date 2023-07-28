import { Route } from "../routing/router.ts";

export interface RequestParameters {
  [name: string]: string;
}

export class Request {
  constructor(
    public readonly route: Route,
    public readonly body: string,
    public readonly params: RequestParameters,
    public readonly auth: string,
  ) {
  }
}
