import { Controller } from "./controller.ts";

export class Component {
  public constructor(
    protected readonly controller: Controller
  ) {
  }
}
