import {ViewVariables} from "../../../types/webserver.ts";

export class Json {
  public static render(
    vars: ViewVariables = new Map<string, string | number | unknown>(),
  ) {
    // Check if vars contains a data object
    // If not, return empty object
    const hasData = vars.has('data');
    if(!hasData) return JSON.stringify({});

    // Return stringified data
    return JSON.stringify(vars.get('data'));
  }
}
