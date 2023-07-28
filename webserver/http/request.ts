import { RouteArgs } from "../routing/router.ts";

export class Request {
  constructor(
    private readonly args: RouteArgs
  ) {
  }
}
