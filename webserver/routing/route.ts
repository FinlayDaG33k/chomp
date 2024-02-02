export class Route {
  public constructor(
    private readonly path: string,
    private readonly controller: string,
    private readonly action: string,
    private readonly method: string
  ) {
  }
  
  public getPath(): typeof this.path { return this.path; }
  
  public getController(): typeof this.controller { return this.controller; }
  
  public getAction(): typeof this.action { return this.action; }
  
  public getMethod(): typeof this.method { return this.method; }
}
