import { isEmpty } from "./rules/is-empty.ts";
import { isNull } from "./rules/is-null.ts";
import { isUndefined } from "./rules/is-undefined.ts";
import {raise} from "../error/raise.ts";
import {minLength} from "./rules/min-length.ts";
import {maxLength} from "./rules/max-length.ts";

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
type ValidationCallback = (input: any, parameters: any) => ValidationCallbackResponse;
type ValidationCallbackSuccess = [undefined];
type ValidationCallbackError = [string];
type ValidationParameter = {[key: string]: any};


const ChompValidators = new Map<string, ValidationCallback>([
  ['isEmpty', isEmpty],
  ['isNull', isNull],
  ['isUndefined', isUndefined],
  ['minLength', minLength],
  ['maxLength', maxLength],
]);

/**
 * Run validator functions on inputs.
 *
 * **NOTE**: This is currently still an alpha feature.
 */
export class Validator {
  private _stopOnFailure: boolean = false;
  private _validators: ValidationStep[] = [];

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
      if(!ChompValidators.has(validator)) raise(`Validator "${validator}" was not found`, 'ValidatorNotFound');
      validator = ChompValidators.get(validator)!;
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
