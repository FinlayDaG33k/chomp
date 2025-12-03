import { ValidationCallback } from "../types/validator.ts";
import { isEmpty } from "./rules/is-empty.ts";
import { isNull } from "./rules/is-null.ts";
import { isUndefined } from "./rules/is-undefined.ts";
import {minLength} from "./rules/min-length.ts";
import {maxLength} from "./rules/max-length.ts";

export const Validators = new Map<string, ValidationCallback>([
  ['isEmpty', isEmpty],
  ['isNull', isNull],
  ['isUndefined', isUndefined],
  ['minLength', minLength],
  ['maxLength', maxLength],
]);
