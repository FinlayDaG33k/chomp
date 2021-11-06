import { engineFactory } from "../../deps.ts";

export class Controller {
  protected name: string = ''
  protected action: string = '';

  protected vars: any = {};

  protected status: number = 200;
  protected body: string = '';
  protected type: string = 'text/html';

  constructor(
    name: string,
    action: string = 'index'
  ) {
    this.name = name;
    this.action = action;
  }

  protected set(key: string, value: any) { this.vars[key] = value; }

  public async render() {
    switch(this.type) {
      case 'application/json':
        this.body = JSON.stringify(this.vars['data']);
        break;
      case 'text/plain':
        this.body = this.vars['message'];
        break;
      case 'text/html':
      default:
        this.body = await this.handlebars();
    }
  }

  private async handlebars() {
    // Initialize our engine
    const engine = engineFactory.getHandlebarsEngine();

    // Read our template
    const template = await Deno.readTextFile(`./src/templates/${this.name[0].toLowerCase() + this.name.slice(1)}/${this.action}.hbs`);

    // Let the engine render
    return await engine(template, this.vars);
  }

  public response() {
    return new Response(
      this.body,
      {
        status: this.status,
        headers: {
          'content-type': this.type,
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
