import "../../src/extensions/date/is-after.ts";
import "../../src/extensions/date/is-after-or-equal.ts";
import "../../src/extensions/date/is-before.ts";
import "../../src/extensions/date/is-before-or-equal.ts";
import "../../src/extensions/date/set-midnight.ts";
import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Date Extensions Test", async (t) => {
  const a = new Date(0);
  const b = new Date(1);
  const c = new Date('2025-09-16T12:13:56.123Z').setMidnight();
  const d = new Date('2025-09-16T12:13:56.123Z').setMidnight(true);

  await t.step("isAfter", () => {
    assertEquals(b.isAfter(a), true);
    assertEquals(a.isAfter(b), false);
    assertEquals(b.isAfter(b), false);
  });

  await t.step("isAfterOrEqual", () => {
    assertEquals(b.isAfterOrEqual(a), true);
    assertEquals(a.isAfterOrEqual(b), false);
    assertEquals(b.isAfterOrEqual(b), true);
  });

  await t.step("isBefore", () => {
    assertEquals(a.isBefore(b), true);
    assertEquals(b.isBefore(a), false);
    assertEquals(b.isBefore(b), false);
  });

  await t.step("isBeforeOrEqual", () => {
    assertEquals(a.isBeforeOrEqual(b), true);
    assertEquals(b.isBeforeOrEqual(a), false);
    assertEquals(b.isBeforeOrEqual(b), true);
  });

  await t.step("setMidnight", () => {
    assertEquals(c.getTime(), 1757973600000);
    assertEquals(d.getTime(), 1758060000000);
    assertEquals(a.isBeforeOrEqual(b), true);
    assertEquals(b.isBeforeOrEqual(a), false);
    assertEquals(b.isBeforeOrEqual(b), true);
  });
});
