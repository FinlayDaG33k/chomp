import {ValidationCallbackResponse, ValidationOptions} from "../../types/validator.ts";
import {valueOrDefault} from "../../utility/value-or-default.ts";

export function minLength(input: any, options: ValidationOptions): ValidationCallbackResponse {
  if(input.length >= valueOrDefault<number>(options.parameters?.length, 0)) return [undefined];
  return [options.message];
}
