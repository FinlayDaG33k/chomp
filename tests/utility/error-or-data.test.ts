import { errorOrData } from "../../src/utility/error-or-data.ts";
import { assertEquals, assertRejects, assertInstanceOf } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import {assertNotInstanceOf} from "https://deno.land/std@0.159.0/testing/asserts.ts";

class AError extends Error {
  name = "AError";
}

class BError extends Error {
  name = "BError";
}

async function good() {
  return "foo";
}

async function bad() {
  throw new AError('AError');
}

Deno.test("errorOrData Test", async (t) => {
  // Test where the result would be good
  await t.step("Good", async () => {
    assertEquals(await errorOrData(good()), [undefined, "foo"]);
  });

  // Test where the result would be a caught AError
  await t.step("Bad (Caught)", async () => {
    const [error, _data] = await errorOrData(bad(), [AError]);
    assertInstanceOf(error, AError);
    assertNotInstanceOf(error, BError);
  });

  // Test where the result would be a thrown BError
  await t.step("Bad (Uncaught)", () => {
    assertRejects(async () => {
      const [_error, _data] = await errorOrData(bad(), [BError]);
    });
  });
});
