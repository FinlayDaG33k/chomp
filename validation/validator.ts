import {raise} from "../error/raise.ts";
import { Validators } from "./rules.ts";

export type ValidationCallback = (input: any, parameters: any) => ValidationCallbackResponse;
export type ValidationCallbackResponse = ValidationCallbackSuccess|ValidationCallbackError;
export type ValidationCallbackParameters = ValidationParameter[];
export type ValidationOptions = {
  last?: boolean;
  message?: string;
  parameters?: ValidationCallbackParameters;
};

type ValidationStep = {
  callback: ValidationCallback
  options: ValidationOptions;
};
type ValidationCallbackSuccess = [undefined];
type ValidationCallbackError = [string];
type ValidationParameter = {[key: string]: any};

/**
 * Run validator functions on inputs.
 *
 * **NOTE**: This is currently still an alpha feature.
 */
export class Validator {
  private _stopOnFailure: boolean = false;
  private _validators: ValidationStep[] = [];

  public create(name: string, validator: ValidationCallback, overwrite: boolean = false) {
    // Check if a validator already exists
    // Skip if we want to override
    if(!overwrite && Validators.has(name)) raise(`Validator named "${name}" already exists!`);

    // Add validator
    Validators.set(name, validator);
  }

  /**
   * Add a validator step
   *
   * @param validator
   * @param options
   */
  public add(validator: ValidationCallback|string, options: ValidationOptions = {}) {
    // Check if validator type is a string
    // If so, check with built-ins
    if(typeof validator === 'string') {
      if(!Validators.has(validator)) raise(`Validator "${validator}" was not found`, 'ValidatorNotFound');
      validator = Validators.get(validator)!;
    }

    // Check if we need to enable the "last" options
    if(this._stopOnFailure) options.last = true;

    // Add step to validators
    this._validators.push({
      callback: validator,
      options: options,
    });

    return this;
  }

  /**
   * Stop validation on the first failing rule instead of checking all possible rules.
   *
   * @param existing Whether to enable this for all existing rules
   */
  public setStopOnFailure(existing: boolean = false) {
    // Enable "last" flag for all new rules
    this._stopOnFailure = true;

    // Enable "last" flag for existing rules if need be
    if(existing) this._validators.forEach((step: ValidationStep) => step.options.last = true);

    return this;
  }

  /**
   * Execute all validator steps
   *
   * @param input
   */
  public execute(input: any) {
    // Create array to collect validation errors
    const errors = [];

    // Execute all validators
    for(const validator of this._validators) {
      // Execute validator
      const [error] = validator['callback'](input, validator.options);

      // Add error to list
      if(error) errors.push(error);

      // Check if we need to keep running
      if(errors.length > 0 && validator['options'].last) break;
    }

    return errors;
  }
}
