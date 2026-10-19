import {assertEquals, assertThrows} from "https://deno.land/std@0.152.0/testing/asserts.ts";
import {Validator} from "../../src/validation/validator.ts";


Deno.test("Validator Test", async (t) => {
  // Create Validator object
  let validator = new Validator();

  await t.step("Create Rule", () => {
    validator.create('Mock Rule', () => [undefined]);
    validator.create('Mock Rule', () => [undefined], true);
    validator.create('Always Fail', () => ['Always fails']);
    validator.create('Always Fail Again', () => ['Always fails as well']);

    assertThrows(
      () => validator.create('Mock Rule', () => [undefined], false)
    )
  });

  await t.step("Add rule", () => {
    validator.add('Mock Rule');
  });

  await t.step("Execute Validators", () => {
    assertEquals(validator.execute(0), []);

    validator.add('Always Fail');
    assertEquals(validator.execute(0), ['Always fails']);
  });

  await t.step("Stop on Failure", () => {
    validator.add('Always Fail Again');
    validator.setStopOnFailure(true);
    assertEquals(validator.execute(0), ['Always fails']);
  });
});
