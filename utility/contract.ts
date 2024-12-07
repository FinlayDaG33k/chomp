import { raise } from "../error/raise.ts";
import { nameOf } from "../mod.ts";

/**
 * Class to more easily throw errors while creating (among others) constructors.
 * Allows code to be more concise and users to more easily read what it does.
 *
 * It was based on the .NET 6 feature of the same name.
 */
export class Contract {
  /**
   * Make sure the condition is true, otherwise throw an error
   *
   * @example Basic Usage
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   *
   * const myStatement = false;
   * Contract.require(myStatement, "Statement must be true");
   * ```
   *
   * @param condition
   * @param message
   */
  public static require(condition: boolean, message: string): void|never {
    if (!condition) raise(message, "ContractRequirementFalse");
  }

  /**
   * Require the input argument to not be null
   *
   * @example Basic Usage
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   *
   * const myArgument = "blabla";
   * Contract.requireNotNull(myArgument, "myArgument");
   * ```
   *
   * @example Using the {@linkcode nameOf} utility
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   * import { nameOf } from "https://deno.land/x/chomp/utility/name-of.ts";
   *
   * const myArgument = "blabla";
   * Contract.requireNotNull(myArgument, nameOf({ myArgument }));
   * ```
   *
   * @param argument
   * @param argumentName
   */
  public static requireNotNull(argument: unknown, argumentName: string): void|never {
    if (argument === null) raise(`${argumentName} may not be null`, "ContractArgumentNull");
  }

  /**
   * Require the input argument to not be undefined
   *
   * @example Basic Usage
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   *
   * const myArgument = "blabla";
   * Contract.requireNotUndefined(myArgument, "myArgument");
   * ```
   *
   * @example Using the {@linkcode nameOf} utility
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   * import { nameOf } from "https://deno.land/x/chomp/utility/name-of.ts";
   *
   * const myArgument = "blabla";
   * Contract.requireNotUndefined(myArgument, nameOf({ myArgument }));
   * ```
   *
   * @param argument
   * @param argumentName
   */
  public static requireNotUndefined(argument: unknown, argumentName: string): void|never {
    if(argument === undefined) raise(`${argumentName} may not be undefined`, "ContractArgumentUndefined");
  }

  /**
   * Require the input argument to not be empty
   *
   *
   * @param argument
   */
  public static requireNotEmpty(argument: unknown): void|never {
    // Check if undefined
    if(argument === undefined) raise(`${nameOf({ argument })} may not be empty`, "ContractArgumentEmpty");

    // Check if null
    if(argument === null) raise(`${nameOf({ argument })} may not be empty`, "ContractArgumentEmpty");

    // Check if empty string
    if(argument === "") raise(`${nameOf({ argument })} may not be empty`, "ContractArgumentEmpty");

    // Check if empty array
    if(Array.isArray(argument) && argument.length === 0) raise(`${nameOf({ argument })} may not be empty`, "ContractArgumentEmpty");

    // Check if empty object
    if(typeof argument === "object" && Object.keys(argument).length === 0) raise(`${nameOf({ argument })} may not be empty`, "ContractArgumentEmpty");
  }
}
