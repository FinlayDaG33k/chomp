import {ValidationCallbackResponse, ValidationOptions} from "../../types/validator.ts";

export function isEmpty(input: any, options: ValidationOptions): ValidationCallbackResponse {
  // Check if empty string
  if(input === "") return [options.message];

  // Check if empty array
  if(Array.isArray(input) && input.length === 0) return [options.message];

  // Check if empty object
  if(typeof input === "object" && Object.keys(input).length === 0) return [options.message];

  // We have something inside
  return [undefined];
}
