import { Inflector } from "../../utility/inflector.ts";
import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

Deno.test("Inflector Test", async (t) => {
  await t.step("ucfirst", () => {
    assertEquals(Inflector.ucfirst('hello world'), 'Hello world');
    assertEquals(Inflector.ucfirst('hello World'), 'Hello World');
  });

  await t.step("lcfirst", () => {
    assertEquals(Inflector.lcfirst('Hello world'), 'hello world');
    assertEquals(Inflector.lcfirst('Hello World'), 'hello World');
  });

  await t.step("pascalize", () => {
    assertEquals(Inflector.pascalize('hello-world'), 'Hello-world');
    assertEquals(Inflector.pascalize('hello_World'), 'HelloWorld');
    assertEquals(Inflector.pascalize('hello-world', '-'), 'HelloWorld');
    assertEquals(Inflector.pascalize('hello_World', '-'), 'Hello_World');
  });

  await t.step("humanize", () => {
    assertEquals(Inflector.humanize('hello-world'), 'Hello-world');
    assertEquals(Inflector.humanize('hello_World'), 'Hello World');
    assertEquals(Inflector.humanize('hello-world', '-'), 'Hello World');
    assertEquals(Inflector.humanize('hello_World', '-'), 'Hello_World');
  });
});
