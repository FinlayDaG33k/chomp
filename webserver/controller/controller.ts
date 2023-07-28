import { Logger } from "../../logging/logger.ts";
import { Inflector } from "../../util/inflector.ts";
import { Handlebars } from "../renderers/handlebars.ts";
import { ResponseBuilder } from "../http/response-builder.ts";

export class Controller {
  protected static readonly _templateDir = `file://${Deno.cwd()}/src/templates`;
  protected response: ResponseBuilder = new ResponseBuilder();
  protected vars: any = {};

  /**
   * Set the 'Content-Type' header
   * 
   * @deprecated Please use "Controller.headers.set()" instead.
   * @param value
   */
  public set type(value = 'text/html') {
    Logger.warning('Setting type on controller itself is deprecated, please use "Controller.headers.set()" instead.');
    this.response.withHeader('Content-Type', value);
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
    switch(this.response.getHeaderLine('Content-Type').toLowerCase()) {
      case 'application/json':
        this.response.withBody(JSON.stringify(this.vars['data']));
        break;
      case 'text/plain':
        this.response.withBody(this.vars['message']);
        break;
      case 'text/html':
      default:
        const body = await Handlebars.render(`${Controller._templateDir}/${Inflector.lcfirst(this.name)}/${this.action}.hbs`, this.vars) ?? '';
        this.response.withBody(body);
    }
  }
}
