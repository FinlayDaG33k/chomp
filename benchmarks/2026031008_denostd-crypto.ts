import { Random } from "../src/security/random.ts";
import { crypto as cryptoOld } from "https://deno.land/std@0.113.0/crypto/mod.ts";
import { crypto as cryptoNew } from "jsr:@std/crypto@1.1.0/crypto";

// Generate dataset
const dataset: Uint8Array[] = [];
for(let i = 0; i < 10_000; i++) {
  const bytes = Random.bytes(128);
  const string = bytes.toHex();

  dataset.push(new TextEncoder().encode(string));
}

Deno.bench("Crypto 0.113.0", async () => {
  for(const entry of dataset) {
    await cryptoOld.subtle.digest("BLAKE3", entry);
  }
});

Deno.bench("Crypto 1.1.0", async () => {
  for(const entry of dataset) {
    await cryptoNew.subtle.digest("BLAKE3", entry);
  }
});

