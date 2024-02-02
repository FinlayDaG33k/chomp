import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { snowflakeToDate } from "../../discord/util/snowflake-to-date.ts";

Deno.test("Discord Utilities Test", async (t) => {
  await t.step("snowflakeToDate", () => {
    assertEquals(snowflakeToDate(91616138860978176n), new Date('2015-09-10T19:29:49.650Z'));
    assertEquals(snowflakeToDate(1011419238923255838n),new Date('2022-08-22T23:38:57.820Z'));
  });
});
