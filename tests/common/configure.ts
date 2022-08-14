import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { Configure } from "../../common/configure.ts";

Deno.test("Configure Test", async (t) => {
  // Add a test variable and test against it
  Configure.set('test1', 'chomp');
  assertEquals(Configure.check('test1'), true);
  assertEquals(Configure.get('test1'), 'chomp');

  // Make sure consume works as intended
  assertEquals(Configure.consume('test1'), 'chomp');
  assertEquals(Configure.check('test1'), false);

  // Add a new test variable and immediately try to delete it
  Configure.set('test2', 'chomp');
  Configure.delete('test2');
  assertEquals(Configure.check('test2'), false);

  // Make sure clearing works
  Configure.set('test3', 'chomp');
  Configure.clear();
  assertEquals(Configure.dump(), []);

  // Make sure default values work on get and consume
  assertEquals(Configure.get('test4', 'default value'), 'default value');
  assertEquals(Configure.get('test5', 'default value'), 'default value');
});
