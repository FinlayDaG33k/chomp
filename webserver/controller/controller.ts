import { Logger } from "../../logging/logger.ts";
import { Headers } from "../http/headers.ts";
import { StatusCodes } from "../http/status-codes.ts";
import { Inflector } from "../../util/inflector.ts";
import { Handlebars } from "../renderers/handlebars.ts";

export class Controller {
  protected static readonly _templateDir = `file://${Deno.cwd()}/src/templates`;
  protected headers: Headers = new Headers();
  protected vars: any = {};
  protected status: StatusCodes = StatusCodes.OK;
  protected body = '';

  /**
   * Set the 'Content-Type' header
   * 
   * @deprecated Please use "Controller.headers.set()" instead.
   * @param value
   */
  public set type(value: string = 'text/html') {
    Logger.warning('Setting type on controller itself is deprecated, please use "Controller.headers.set()" instead.');
    this.headers.set('Content-Type', value);
  }

  constructor(
    protected readonly name: string,
    protected readonly action: string = 'index',
  ) {
  }

  /**
   * Set a view variable
   *
   * @param key
   * @param value
   */
  protected set(key: string, value: any) { this.vars[key] = value; }

  /**
   * Render the page output
   * Will try to decide the best way of doing it based on the MIME set
   *
   * @returns Promise<void>
   */
  public async render(): Promise<void> {
    switch(this.headers.get('Content-Type').toLowerCase()) {
      case 'application/json':
        this.body = JSON.stringify(this.vars['data']);
        break;
      case 'text/plain':
        this.body = this.vars['message'];
        break;
      case 'text/html':
      default:
        this.body = await Handlebars.render(`${Controller._templateDir}/${Inflector.lcfirst(this.name)}/${this.action}.hbs`, this.vars) ?? '';
    }
  }

  public response() {
    return new Response(
      this.body,
      {
        status: this.status,
        headers: this.headers.get(),
      }
    );
  }
}
