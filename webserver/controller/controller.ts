import { Logger } from "../../logging/logger.ts";
import { Inflector } from "../../util/inflector.ts";
import { Handlebars } from "../renderers/handlebars.ts";
import { ResponseBuilder } from "../http/response-builder.ts";
import { Request } from "../http/request.ts";

export interface ViewVariable {
  [key: string]: string|number|unknown;
}

export class Controller {
  private static readonly _templateDir = `file://${Deno.cwd()}/src/templates`;
  private _response: ResponseBuilder = new ResponseBuilder();
  private _vars: ViewVariable = <ViewVariable>{};

  /**
   * Set the 'Content-Type' header
   * 
   * @deprecated Please use "Controller.getResponse().withType()" instead.
   * @param value
   */
  public set type(value = 'text/html') {
    Logger.warning('Setting type on controller itself is deprecated, please use "Controller.getResponse().withType()" instead.');
    this.getResponse().withHeader('Content-Type', value);
  }

  constructor(
    protected readonly request: Request,
  ) {
  }

  /**
   * Get the request object for this controller
   *
   * @protected
   */
  protected getRequest(): typeof this.request {
    return this.request;
  }
  
  /**
   * Get the response object for this controller
   * 
   * @protected
   */
  protected getResponse(): typeof this._response {
    return this._response;
  }

  /**
   * Set a view variable
   *
   * @param key
   * @param value
   */
  protected set(key: string, value: string|number|unknown) { this._vars[key] = value; }

  /**
   * Render the page output
   * Will try to decide the best way of doing it based on the MIME set
   *
   * @returns Promise<void>
   */
  public async render(): Promise<void> {
    switch(this.getResponse().getHeaderLine('Content-Type').toLowerCase()) {
      case 'application/json':
        this.getResponse().withBody(JSON.stringify(this._vars['data']));
        break;
      case 'text/plain':
        this.getResponse().withBody(this._vars['message'] as string);
        break;
      case 'text/html':
      default:
        const controller = Inflector.lcfirst(this.getRequest().getRoute().getController());
        const action = this.getRequest().getRoute().getAction();
        const body = await Handlebars.render(`${Controller._templateDir}/${controller}/${action}.hbs`, this._vars) ?? '';
        this.getResponse().withBody(body);
    }
  }
}
