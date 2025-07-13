import { isEmpty } from "./rules/is-empty.ts";
import { isNull } from "./rules/is-null.ts";
import { isUndefined } from "./rules/is-undefined.ts";
import {raise} from "../error/raise.ts";

export type ValidationCallbackResponse = ValidationCallbackSuccess|ValidationCallbackError;

type ValidationStep = {
  callback: ValidationCallback
  errorMessage?: string;
};
type ValidationCallback = (input: any) => ValidationCallbackResponse;
type ValidationCallbackSuccess = [undefined];
type ValidationCallbackError = [string];

const ChompValidators = new Map<string, ValidationCallback>([
  ['isEmpty', isEmpty],
  ['isNull', isNull],
  ['isUndefined', isUndefined],
]);

/**
 * Run validator functions on inputs.
 *
 * **NOTE**: This is currently still an alpha feature.
 */
export class Validator {
  private _validators: ValidationStep[] = [];

  /**
   * Add a validator step
   *
   * @param validator
   * @param message
   */
  public add(validator: ValidationCallback|string, message?: string) {
    // Check if validator type is a string
    // If so, check with built-ins
    if(typeof validator === 'string') {
      if(!ChompValidators.has(validator)) raise(`Validator "${validator}" was not found`, 'ValidatorNotFound');
      validator = ChompValidators.get(validator)!;
    }

    // Add step to validators
    this._validators.push({
      callback: validator,
      errorMessage: message,
    });

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

    for(const validator of this._validators) {
      const [error] = validator['callback'](input);
      if(error) errors.push(error);
    }
  }
}
