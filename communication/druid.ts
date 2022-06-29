export class Druid {
  private spec: any = null;
  public set setSpec(spec: any) { this.spec = spec; }
  public get getSpec() { return this.spec; }

  public constructor(
    private readonly host: string,
  ) {
  }

  public async create(): Promise<any> {
    return await fetch(`${this.host}/druid/indexer/v1/task`, {
      method: 'POST',
      body: this.spec,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
