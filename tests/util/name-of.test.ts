import { assertEquals, assertNotEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import {nameOf} from "../../utility/name-of.ts";

Deno.test("nameOf Test", async (t) => {
  const testArgument = "blabla";
  assertEquals(nameOf({ testArgument }), "testArgument");
  assertNotEquals(nameOf({ testArgument }), "testargument");
});
