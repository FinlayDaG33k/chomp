import { Contract } from "../../utility/contract.ts";
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
    assert(() => Contract.requireNotNull("blabla", "testArgument"));
  });

  await t.step("requireNotUndefined", () => {
    // Test when the argument is undefined
    assertThrows(() => Contract.requireNotUndefined(undefined, "testArgument"));

    // Test when the argument is not undefined
    assert(() => Contract.requireNotUndefined("blabla", "testArgument"));
  });

  await t.step("requireNotEmpty", () => {
    // Test when the argument is empty
    assertThrows(() => Contract.requireNotEmpty(undefined));
    assertThrows(() => Contract.requireNotEmpty(null));
    assertThrows(() => Contract.requireNotEmpty(""));
    assertThrows(() => Contract.requireNotEmpty([]));
    assertThrows(() => Contract.requireNotEmpty({}));

    // Test when the argument is not empty
    assert(() => Contract.requireNotEmpty(0));
    assert(() => Contract.requireNotEmpty("blabla"));
    assert(() => Contract.requireNotEmpty([1]));
    assert(() => Contract.requireNotEmpty({key: "value"}));
  });

  await t.step("requireEmpty", () => {
    // Test when the argument is not empty
    assertThrows(() => Contract.requireEmpty(0));
    assertThrows(() => Contract.requireEmpty("blabla"));
    assertThrows(() => Contract.requireEmpty([1]));
    assertThrows(() => Contract.requireEmpty({key: "value"}));

    // Test when the argument is empty
    assert(() => Contract.requireEmpty(undefined));
    assert(() => Contract.requireEmpty(null));
    assert(() => Contract.requireEmpty(""));
    assert(() => Contract.requireEmpty([]));
    assert(() => Contract.requireEmpty({}));
  })
});
