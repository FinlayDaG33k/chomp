import { Password } from "../../src/security/password.ts";
import { Algorithms } from "../../src/types/hash.ts";
import {assertEquals, assertNotEquals, assertRejects} from "https://deno.land/std@0.152.0/testing/asserts.ts";

const testHash = "d88!10!insecure-salt!a7129d5e75c40adc84235abac626f2bccd863600ad9db0dcc03950974bd8c9c1";
const testPassword = "lamepassword";
const invalidTestPassword = "incorrect-password";
const testSalt = "insecure-salt";
const insecureTestHash = "db7!10!insecure-salt!5d555c2d9ebfce2f53e138231ed3e3e9";

Deno.test("Password Test", async (t) => {
  await t.step("Hash", async () => {
    // Static salt
    assertEquals(
      await Password.hash(testPassword, Algorithms.SHA3_256, {
        salt: testSalt,
      }),
      testHash
    );

    // Randomized salt
    const a = await Password.hash(testPassword, Algorithms.SHA3_256);
    const b = await Password.hash(testPassword, Algorithms.SHA3_256);
    assertNotEquals(a, b);
  });

  await t.step("Verify", async () => {
    assertEquals(await Password.verify(testPassword, testHash), true);
    assertEquals(await Password.verify(invalidTestPassword, testHash), false);
  });

  await t.step("Insecure Algorithm Selection", async() => {
    // Test when not allowing an insecure algorithm (default)
    await assertRejects(async () => await Password.hash(testPassword, Algorithms.MD5));

    // Test override
    assertEquals(
      await Password.hash(testPassword, Algorithms.MD5, {
        salt: testSalt,
        allowInsecure: true
      }),
      insecureTestHash
    );
  })
});
