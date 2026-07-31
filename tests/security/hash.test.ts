import {Hash} from "../../src/security/hash.ts";
import {Algorithms} from "../../src/types/hash.ts";
import { assertEquals} from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Hash Test", async (t) => {
  // Create Hash
  const h = new Hash("test", Algorithms.SHA3_256);

  await t.step("Digest", async () => {
    // TODO: Actually test it properly
    // I can't find it out for the love of god
    await h.digest();
  });

  await t.step("Hex", () => {
    assertEquals(h.hex(), "36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80");
  });
});
