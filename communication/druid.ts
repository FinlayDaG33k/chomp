export class Druid {
  // deno-lint-ignore no-explicit-any -- TODO
  private spec: any = null;
  // deno-lint-ignore no-explicit-any -- TODO
  public set setSpec(spec: any) { this.spec = spec; }
  // deno-lint-ignore no-explicit-any -- TODO
  public get getSpec(): any { return this.spec; }

  public constructor(
    private readonly host: string,
  ) {
  }

  /**
   * Create a new task in Apache Druid
   *
   * @returns Promise<Response>
   */
  public async create(): Promise<Response> {
    if(!this.spec) throw Error('No task specification has been set!');
    return await fetch(`${this.host}/druid/indexer/v1/task`, {
      method: 'POST',
      body: this.spec,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
