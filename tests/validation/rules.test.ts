import { isEmpty } from "../../src/validation/rules/is-empty.ts";
import { isNull } from "../../src/validation/rules/is-null.ts";
import { isUndefined } from "../../src/validation/rules/is-undefined.ts";
import { minLength } from "../../src/validation/rules/min-length.ts";
import { maxLength } from "../../src/validation/rules/max-length.ts";
import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Validator Test", async (t) => {
  await t.step("isEmpty", () => {
    const message = "Passed argument not empty!";
    const params = {message: message}

    assertEquals(isEmpty([], params), [undefined]);
    assertEquals(isEmpty([0], params), [message]);
  });

  await t.step("isNull", () => {
    const message = "Passed argument not null!";
    const params = {message: message}

    assertEquals(isNull(null, params), [undefined]);
    assertEquals(isNull(0, params), [message]);
  });

  await t.step("isUndefined", () => {
    const message = "Passed argument not undefined!";
    const params = {message: message}

    assertEquals(isUndefined(undefined, params), [undefined]);
    assertEquals(isUndefined(0, params), [message]);
  });

  await t.step("minLength", () => {
    const message = "Passed argument not long enough!";
    const params = {
      message: message,
      parameters: {
        length: 2
      }
    };

    // Test for strings
    assertEquals(minLength("ab", params), [undefined]);
    assertEquals(minLength("a", params), [message]);

    // Test for arrays
    assertEquals(minLength([1,2], params), [undefined]);
    assertEquals(minLength([1], params), [message]);
  });

  await t.step("maxLength", () => {
    const message = "Passed argument too long!";
    const params = {
      message: message,
      parameters: {
        length: 1
      }
    };

    // Test for strings
    assertEquals(maxLength("a", params), [undefined]);
    assertEquals(maxLength("ab", params), [message]);

    // Test for arrays
    assertEquals(maxLength([1], params), [undefined]);
    assertEquals(maxLength([1,2], params), [message]);
  });
});
