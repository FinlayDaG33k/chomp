import {ValidationCallbackResponse, ValidationOptions} from "../../../types/validator.ts";
import {valueOrDefault} from "../../utility/value-or-default.ts";

export function minLength(input: any, options: ValidationOptions): ValidationCallbackResponse {
  // Check if a minimum length was specified
  // If not, default to 0
  const min = valueOrDefault<number>(options.parameters?.length, 0);

  // Check if we are above the minimum length
  const minLengthReached = input.length >= min;
  if(minLengthReached) return [undefined];

  // Minimum length was not reached
  return [options.message];
}
