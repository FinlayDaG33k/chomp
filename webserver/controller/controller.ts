import { handlebarsEngine } from "https://raw.githubusercontent.com/FinlayDaG33k/view-engine/patch-1/mod.ts";
import { Logger } from "../../logging/logger.ts";
import { Headers } from "../http/headers.ts";
import { StatusCodes } from "../http/status-codes.ts";
import { Inflector } from "../../util/inflector.ts";

export class Controller {
  protected readonly _templateDir = './src/templates';
  protected headers: Headers = new Headers();
  protected vars: any = {};
  protected status: StatusCodes = StatusCodes.OK;
  protected body = '';

  /**
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
        this.body = await this.handlebars();
    }
  }

  /**
   * Render Handlebars templates
   *
   * @returns Promise<any>
   */
  private async handlebars(): Promise<any> {
    // Get our template location
    const path = `${this._templateDir}/${Inflector.lcfirst(this.name)}/${this.action}.hbs`;

    // Make sure out template exists
    try {
      await Deno.stat(path);
    } catch(e) {
      Logger.error(`Could not find template for "${Inflector.lcfirst(this.name)}#${this.action}"`, e.stack);
      return;
    }

    // Read our template
    const template = await Deno.readTextFile(`${this._templateDir}/${Inflector.lcfirst(this.name)}/${this.action}.hbs`);

    // Let the engine render
    return handlebarsEngine(template, this.vars);
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
