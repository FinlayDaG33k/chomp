/**
 * Allow running a fetch with a timeout
 *
 * @param input
 * @param init
 * @param timeout Milliseconds to wait before abording
 */
export function fetchWithTimeout(input: URL|Request|string, init: RequestInit = {}, timeout = 5000): Promise<Response> {
  // Inject automatic abortion after 5 seconds
  const controller = new AbortController();
  init.signal = controller.signal;
  setTimeout(() => controller.abort(), timeout);

  // Create and return fetch
  return fetch(input, init);
}
