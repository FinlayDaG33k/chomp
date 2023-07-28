import { RouteArgs } from "../routing/router.ts";

export class Request {
  constructor(
    public readonly args: RouteArgs
  ) {
  }
}
