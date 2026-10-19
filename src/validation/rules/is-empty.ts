import {ValidationCallbackResponse, ValidationOptions} from "../../types/validator.ts";
import {empty} from "../../../mod.ts";

export function isEmpty(input: any, options: ValidationOptions): ValidationCallbackResponse {
  // Check if input is empty
  // If so, return the message
  const inputIsEmpty = empty(input);
  if(inputIsEmpty) return [undefined];

  // We have something inside
  return [options.message];
}
