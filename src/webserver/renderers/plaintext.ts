import {ViewVariables} from "../../../types/webserver.ts";

export class Plaintext {
  public static render(
    vars: ViewVariables = new Map<string, string | number | unknown>(),
  ): string {
    // Check if vars contains a data object
    // If not, return empty string
    const hasData = vars.has('message');
    if(!hasData) return '';

    // Return stringified data
    return <string>vars.get('message');
  }
}
