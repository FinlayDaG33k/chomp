type SuccessResponse<T> = [undefined, T];

export async function errorOrData<T, E extends new (message?: string) => Error>(promise: Promise<T>, catchables?: E[]): Promise<SuccessResponse<T> | [InstanceType<E>]> {
  try {
    const data = await promise;
    return [undefined, data] as SuccessResponse<T>;
  } catch (error) {
    // If no catchables are defined just return all errors
    if (catchables === undefined) return [error];

    // Check if our error is any of the catchables
    if (catchables.some((e: E): boolean => error instanceof e)) return [error];

    // Throw the error
    throw error;
  }
}
