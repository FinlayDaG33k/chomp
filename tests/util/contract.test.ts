import { Contract } from "../../utility/contract.ts";
import { nameOf } from "../../utility/name-of.ts";
import { assert, assertThrows } from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Contract Test", async (t) => {

  await t.step("require", () => {
    // Test when the condition is false
    assertThrows(() => Contract.require(false, "Condition must be true"));

    // Test when the condition if true
    assert(() => Contract.require(true, "Condition must be true"));
  });

  await t.step("requireNotNull", () => {
    // Test when the argument is null
    assertThrows(() => Contract.requireNotNull(null, "testArgument"));

    // Test when the argument is not null
    assert(() => Contract.requireNotNull("blabla", "testArgument"))
  });
});
