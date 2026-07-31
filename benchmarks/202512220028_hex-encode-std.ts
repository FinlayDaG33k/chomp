import { encodeHex as std } from "jsr:@std/encoding@1.0.10";
import { Random } from "../src/security/random.ts";

// Generate dataset
const dataset: Uint8Array[] = [];
for(let i = 0; i < 10_000; i++) {
  dataset.push(Random.bytes(128));
}

/**
 * Old hex encoding function
 *
 * @param input
 */
function old(input: Uint8Array): string {
  return [...new Uint8Array(input)].map((x) => x.toString(16).padStart(2, "0")).join("");
}


Deno.bench("Old Method", () => {
  for(const entry of dataset) {
    old(entry);
  }
});

Deno.bench("Standard Library", () => {
  for(const entry of dataset) {
    std(entry);
  }
});

