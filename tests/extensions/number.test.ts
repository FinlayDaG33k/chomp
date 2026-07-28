import "../../src/extensions/number/round-nearest.ts";
import {assertEquals} from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Number Extensions", async (t) => {
  await t.step("roundNearest", () => {
    const a = 6;
    const b = 2;
    assertEquals(a.roundNearest(5), 5);
    assertEquals(b.roundNearest(5), 0);
    assertEquals(a.roundNearest(10), 10);
    assertEquals(b.roundNearest(10), 0);

    const c = 70;
    const d = 40;
    const e = 20;
    assertEquals(c.roundNearest(50), 50);
    assertEquals(d.roundNearest(50), 50);
    assertEquals(e.roundNearest(50), 0);

    const f = 180;
    const g = 230;
    assertEquals(f.roundNearest(100), 200);
    assertEquals(g.roundNearest(100), 200);

    const h = 1900;
    assertEquals(h.roundNearest(1000), 2000);
  });
});
