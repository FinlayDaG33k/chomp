import {ViewVariables} from "../../../types/webserver.ts";

export class OctetStream {
  public static render(
    vars: ViewVariables = new Map<string, string | number | unknown>(),
  ): Uint8Array {
    // Check if vars contains a data object
    // If not, return empty array
    const hasData = vars.has('data');
    if(!hasData) return new Uint8Array();

    // Return stringified data
    return <Uint8Array>vars.get('data');
  }
}
