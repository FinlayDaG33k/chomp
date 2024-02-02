import { assertThrows } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { raise } from "../../error/raise.ts";

class CustomError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

Deno.test("Errors Test", () => {
  // Check with a "simple" raise
  assertThrows(() => raise('Some Error Message'), Error, 'Some Error Message');
  
  // Check with custom Error type (via string)
  assertThrows(() => raise('Some Error Message', 'CustomError'), Error, 'Some Error Message');
  
  // Check with custom Error type (via class)
  assertThrows(() => raise('Some Error Message', CustomError), CustomError, 'Some Error Message');
});
