import {ValidationCallbackResponse, ValidationOptions} from "../../../types/validator.ts";

export function isUndefined(input: any, options: ValidationOptions): ValidationCallbackResponse {
  if(input === undefined) return [undefined];
  return [options.message];
}
