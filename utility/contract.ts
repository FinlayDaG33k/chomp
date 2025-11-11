import { raise } from "../error/raise.ts";
import { empty } from "./empty.ts";
import { nameOf } from "./name-of.ts";

/**
 * Class to more easily throw errors while creating (among others) constructors.
 * Allows code to be more concise and users to more easily read what it does.
 *
 * Its idea was based on the .NET 6 feature of the same name.
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
   * Contract.requireNotNull(myArgument);
   * ```
   *
   * @param argument
   * @param message
   */
  public static requireNotNull<T>(argument: T, message?: string): asserts argument is Exclude<T, null> {
    if (argument === null) raise(message ? message : `Contract failed, argument ("${argument}") was null`, "ContractArgumentNull");
  }

  /**
   * Require the input argument to not be undefined
   *
   * @example Basic Usage
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   *
   * const myArgument = "blabla";
   * Contract.requireNotUndefined(myArgument);
   * ```
   *
   * @param argument
   * @param message
   */
  public static requireNotUndefined<T>(argument: T, message?: string): asserts argument is Exclude<T, undefined> {
    if(argument === undefined) raise(message ? message : `Contract failed, argument ("${argument}") was undefined`, "ContractArgumentUndefined");
  }

  /**
   * Require the input to not be nullish.
   *
   * Internally acts as a proxy for {@linkcode Contract.requireNotUndefined} and {@linkcode Contract.requireNotNull}.
   *
   * @example Basic Usage
   * ```ts
   * import { Contract } from "https://deno.land/x/chomp/utility/contract.ts";
   *
   * const myArgument = "blabla";
   * Contract.requireNotNullish(myArgument);
   * ```
   *
   * @param argument
   * @param message
   */
  public static requireNotNullish<T>(argument: T, message?: string): asserts argument is Exclude<Exclude<T, null>, undefined> {
    Contract.requireNotUndefined(argument, message);
    Contract.requireNotNull(argument, message);
  }

  /**
   * Require the input argument to not be empty
   *
   * @param argument
   */
  public static requireNotEmpty<T>(argument: T): void|never {
    if(empty(argument)) raise(`${nameOf({ argument })} may not be empty`, "ContractArgumentEmpty")
  }

  /**
   * Require the input argument to not be empty
   *
   *
   * @param argument
   */
  public static requireEmpty<T>(argument: T): void|never {
    if(!empty(argument)) raise(`${nameOf({ argument })} must be empty`, "ContractArgumentNotEmpty");
  }
}
