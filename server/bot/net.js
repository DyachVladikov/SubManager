import { Agent as HttpsAgent } from "node:https";

export const telegramHttpsAgent = new HttpsAgent({ keepAlive: true });

export async function fetchRetry(url, options, attempts = 6) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 700 * (i + 1)));
    }
  }
  throw lastError;
}
