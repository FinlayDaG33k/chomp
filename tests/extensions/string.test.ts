import "../../src/extensions/string/empty.ts";
import {assertEquals} from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("String Extensions", async (t) => {
  await t.step("Empty", () => {
    assertEquals(String.empty === "", true);
    assertEquals(String.empty === "foo", false);
  });
});
