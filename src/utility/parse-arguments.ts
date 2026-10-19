import { parseArgs, ParseOptions } from "jsr:@std/cli@1.0.23/parse-args";

export function parseArguments(options: ParseOptions = {}) {
  return parseArgs(Deno.args, options);
}
