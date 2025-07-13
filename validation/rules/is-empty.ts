import {ValidationCallbackResponse} from "../validator.ts";

export function isEmpty(input: any, errorMessage?: string): ValidationCallbackResponse {
// Check if empty string
  if(input === "") return [errorMessage];

  // Check if empty array
  if(Array.isArray(input) && input.length === 0) return [errorMessage];

  // Check if empty object
  if(typeof input === "object" && Object.keys(input).length === 0) return [errorMessage];

  // We have something inside
  return [undefined];
}
