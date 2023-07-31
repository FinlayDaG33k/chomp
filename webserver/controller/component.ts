import { Controller } from "./controller.ts";

export class Component {
  public constructor(
    private readonly controller: Controller
  ) {
  }
  
  protected getController(): typeof this.controller {
    return this.controller;
  }
}
