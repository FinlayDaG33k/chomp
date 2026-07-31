import { Random } from "../src/security/random.ts";
import { crypto as cryptoOld } from "https://deno.land/std@0.113.0/crypto/mod.ts";
import { crypto as cryptoNew } from "jsr:@std/crypto@1.1.0/crypto";

Deno.bench("Crypto 0.113.0", {n: 100_000 }, async (b) => {
  // Prepare bytes
  const bytes = Random.bytes(128);
  const string = bytes.toHex();
  const encoded = new TextEncoder().encode(string);

  // Benchmark
  b.start();
  await cryptoOld.subtle.digest("BLAKE3", encoded);
  b.end();

});

Deno.bench("Crypto 1.1.0", {n: 10_000 }, async (b) => {
  // Prepare bytes
  const bytes = Random.bytes(128);
  const string = bytes.toHex();
  const encoded = new TextEncoder().encode(string);

  // Benchmark
  b.start();
  await cryptoNew.subtle.digest("BLAKE3", encoded);
  b.end();
});

