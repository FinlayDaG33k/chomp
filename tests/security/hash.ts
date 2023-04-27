import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

interface TestVector {
  input: Uint8Array|string;
  output: string;
}

Deno.test("Chomp/Security/Hash", async (t) => {
  const vectors: TestVector[] = [
    {
      input: "",
      output: "",
    },
    {
      input: new Uint8Array([]),
      output: ""
    },
  ];

  for (const vector of vectors) {
    const res = '';
    assertEquals(vector.output, res);
  }
});
