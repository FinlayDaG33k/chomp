import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { Text } from "../../utility/text.ts";

Deno.test("Text Test", async (t) => {
  Deno.test("htmlentities", async (t) => {
    // Test all supported entities
    assertEquals(Text.htmlentities('&'), '&amp;');
    assertEquals(Text.htmlentities('<'), '&lt;');
    assertEquals(Text.htmlentities('>'), '&gt;');
    assertEquals(Text.htmlentities('\''), '&#39;');
    assertEquals(Text.htmlentities('"'), '&quot;');

    // Test regular characters
    assertEquals(Text.htmlentities('1'), '1');
    assertEquals(Text.htmlentities('2'), '2');
    assertEquals(Text.htmlentities('a'), 'a');
    assertEquals(Text.htmlentities('b'), 'b');
  });
});
