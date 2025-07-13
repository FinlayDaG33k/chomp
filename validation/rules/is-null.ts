import {ValidationCallbackResponse} from "../validator.ts";

export function isNull(input: any, errorMessage?: string): ValidationCallbackResponse {
  if(input !== null) return [errorMessage];
  return [undefined];
}
