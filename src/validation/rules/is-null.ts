import {ValidationCallbackResponse, ValidationOptions} from "../../types/validator.ts";

export function isNull(input: any, options: ValidationOptions): ValidationCallbackResponse {
  if(input === null) return [undefined];
  return [options.message];
}
