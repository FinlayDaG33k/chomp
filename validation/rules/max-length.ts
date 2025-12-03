import {ValidationCallbackResponse, ValidationOptions} from "../../types/validator.ts";
import {valueOrDefault} from "../../utility/value-or-default.ts";

export function maxLength(input: any, options: ValidationOptions): ValidationCallbackResponse {
  if(input.length < valueOrDefault<number>(options.parameters?.length, 0)) return [undefined];
  return [options.message];
}
