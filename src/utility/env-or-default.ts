/**
 * Check if env variable has value, otherwise return a specified default
 *
 * @param key
 * @param defaultValue
 */
export function envOrDefault<T>(key: string, defaultValue: T|null = null): T {
  // Check if we have permission
  // If not, return the default
  const hasPermission = Deno.permissions.querySync({name: "env" }).state === "granted";
  if(!hasPermission) return defaultValue as T;

  // Check if the env has a key
  // If not, return the default
  const hasKey = Deno.env.has(key);
  if(!hasKey) return defaultValue as T;

  // Return the value specified by the env
  return Deno.env.get(key) as T;
}
