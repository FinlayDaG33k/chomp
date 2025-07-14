import {ValidationCallbackResponse, ValidationOptions} from "../validator.ts";

export function isNull(input: any, options: ValidationOptions): ValidationCallbackResponse {
  if(input === null) return [undefined];
  return [undefined];
}
