import {ValidationCallbackResponse} from "../validator.ts";

export function isUndefined(input: any, errorMessage?: string): ValidationCallbackResponse {
  if(input !== undefined) return [errorMessage];
  return [undefined];
}
