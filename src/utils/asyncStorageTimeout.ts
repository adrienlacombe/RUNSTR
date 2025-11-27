/**
 * AsyncStorage timeout wrapper to prevent UI freezing
 * Adds timeout protection to all AsyncStorage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wraps an AsyncStorage operation with a timeout
 * @param promise The AsyncStorage operation promise
 * @param timeoutMs Timeout in milliseconds (default 2000ms)
 * @param defaultValue Default value to return on timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 2000,
  defaultValue?: T
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(`AsyncStorage operation timed out after ${timeoutMs}ms`)
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.warn(
      '[AsyncStorageTimeout] Operation timed out, returning default:',
      error
    );
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Safe AsyncStorage.getItem with timeout protection
 */
export async function safeGetItem(
  key: string,
  timeoutMs: number = 2000,
  defaultValue: string | null = null
): Promise<string | null> {
  try {
    return await withTimeout(
      AsyncStorage.getItem(key),
      timeoutMs,
      defaultValue
    );
  } catch (error) {
    console.warn(`[AsyncStorageTimeout] Failed to get ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Safe AsyncStorage.multiGet with timeout protection
 */
export async function safeMultiGet(
  keys: string[],
  timeoutMs: number = 3000
): Promise<readonly [string, string | null][]> {
  try {
    return await withTimeout(
      AsyncStorage.multiGet(keys),
      timeoutMs,
      keys.map((key) => [key, null] as [string, string | null])
    );
  } catch (error) {
    console.warn('[AsyncStorageTimeout] multiGet failed:', error);
    return keys.map((key) => [key, null] as [string, string | null]);
  }
}

/**
 * Safe AsyncStorage.setItem with timeout protection
 */
export async function safeSetItem(
  key: string,
  value: string,
  timeoutMs: number = 2000
): Promise<void> {
  try {
    await withTimeout(AsyncStorage.setItem(key, value), timeoutMs);
  } catch (error) {
    console.warn(`[AsyncStorageTimeout] Failed to set ${key}:`, error);
    // Don't throw - allow app to continue even if save fails
  }
}

/**
 * Safe AsyncStorage.removeItem with timeout protection
 */
export async function safeRemoveItem(
  key: string,
  timeoutMs: number = 2000
): Promise<void> {
  try {
    await withTimeout(AsyncStorage.removeItem(key), timeoutMs);
  } catch (error) {
    console.warn(`[AsyncStorageTimeout] Failed to remove ${key}:`, error);
    // Don't throw - allow app to continue even if removal fails
  }
}
