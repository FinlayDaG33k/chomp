import { Logger } from "../logging/logger.ts";
export { config as env } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
Logger.warning("Usage of \"deno-lib/common/env.ts\" is deprecated and may be removed soon, please use \"deno-lib/common/configure.ts\" instead.");
