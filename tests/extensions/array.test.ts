import "../../extensions/array/includes-any.ts";
import {assertEquals} from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Array Extensions", async (t) => {
  await t.step("includesAny", () => {
    const a = [1,2,3,4];
    const b = [2, 5];
    const c = [5, 6];

    assertEquals(a.includesAny(b), true);
    assertEquals(a.includesAny(c), false);
  });
});
