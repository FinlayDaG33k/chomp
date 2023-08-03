import { Logger } from "../../logging/logger.ts";
import { Inflector } from "../../utility/inflector.ts";
import { Handlebars } from "../renderers/handlebars.ts";
import { ResponseBuilder } from "../http/response-builder.ts";
import { Request } from "../http/request.ts";
import { raise } from "../../utility/raise.ts";
import { Component } from "./component.ts";
import { Registry } from "../registry/registry.ts";
import { compress as compressBrotli } from "https://deno.land/x/brotli@v0.1.4/mod.ts";

export interface ViewVariable {
  [key: string]: string|number|unknown;
}

export class Controller {
  private static readonly _templateDir = `./src/templates`;
  private static readonly _componentDir = `file:///${Deno.cwd()}/src/controller/component`;
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
   * Initialize the controller.
   * Literally does nothing at this moment except exist to prevent errors.
   * 
   * @protected
   */
  public async initialize(): Promise<void> {}
  
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

  protected async loadComponent(name: string): Promise<Controller> {
    // Check if we already loaded the component before
    // Use that if so
    if(Registry.has(`${Inflector.ucfirst(name)}Component`)) {
      const module = Registry.get(`${Inflector.ucfirst(name)}Component`);
      this[Inflector.ucfirst(name)] = new module[`${Inflector.ucfirst(name)}Component`](this);
      return this;
    }
    
    // Import the module
    const module = await import(`${Controller._componentDir}/${Inflector.lcfirst(name)}.ts`);

    // Make sure the component class was found
    if(!(`${Inflector.ucfirst(name)}Component` in module)) {
      raise(`No class "${Inflector.ucfirst(name)}Component" could be found.`);
    }

    // Make sure the component class extends our base controller
    if(!(module[`${Inflector.ucfirst(name)}Component`].prototype instanceof Component)) {
      raise(`Class "${Inflector.ucfirst(name)}Component" does not properly extend Chomp's component.`);
    }
    
    // Add the component to the registry
    Registry.add(`${Inflector.ucfirst(name)}Component`, module);
    
    // Add the module as class property
    this[Inflector.ucfirst(name)] = new module[`${Inflector.ucfirst(name)}Component`](this);
    
    return this;
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
    let body: string|Uint8Array = '';
    let canCompress = true;
    switch(this.getResponse().getHeaderLine('Content-Type').toLowerCase()) {
      case 'application/json':
        body = JSON.stringify(this._vars['data']);
        break;
      case 'text/plain':
        body = this._vars['message'] as string;
        break;
      case 'text/html':
        const controller = Inflector.lcfirst(this.getRequest().getRoute().getController());
        const action = this.getRequest().getRoute().getAction();
        body = await Handlebars.render(`${Controller._templateDir}/${controller}/${action}.hbs`, this._vars) ?? raise('Could not render handlebars');
    }
    
    // Check if we can compress with Brotli
    // TODO: Hope that Deno will make this obsolete.
    if(this.getRequest().getHeaders().get('accept-encoding').includes('br') && canCompress && body.length > 1024) {
      Logger.debug(`Compressing body with brotli: ${body.length}-bytes`);
      body = compressBrotli(new TextEncoder().encode(body));
      Logger.debug(`Compressed body with brotli: ${body.length}-bytes`);
      this.getResponse().withHeader('Content-Encoding', 'br');
    }
    
    // Set our final body
    this.getResponse().withBody(body);
  }
}
