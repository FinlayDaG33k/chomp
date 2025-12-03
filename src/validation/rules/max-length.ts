import {ValidationCallbackResponse, ValidationOptions} from "../../types/validator.ts";
import {valueOrDefault} from "../../utility/value-or-default.ts";

export function maxLength(input: any, options: ValidationOptions): ValidationCallbackResponse {
  // Get the max length
  // If not set, default to 0
  const max = valueOrDefault<number>(options.parameters?.length, 0);

  // Check if we are below the maximum length
  const maxLengthExceeded = input.length > max;
  if(maxLengthExceeded) return [undefined];

  // Max length was exceeded
  return [options.message];
}
