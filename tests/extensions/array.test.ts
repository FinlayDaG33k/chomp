import "../../src/extensions/array/includes-any.ts";
import "../../src/extensions/array/find-clostest-number.ts";
import {assertEquals} from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Array Extensions", async (t) => {
  await t.step("includesAny", () => {
    const a = [1,2,3,4];
    const b = [2, 5];
    const c = [5, 6];

    assertEquals(a.includesAny(b), true);
    assertEquals(a.includesAny(c), false);
  });

  await t.step("findClosestNumber", () => {
    const array = [100, 200, 300];

    assertEquals(array.findClosestNumber(80), 100);
    assertEquals(array.findClosestNumber(40), 100);
    assertEquals(array.findClosestNumber(120), 100);
    assertEquals(array.findClosestNumber(180), 200);
  })
});
