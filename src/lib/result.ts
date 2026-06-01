/**
 * A typed Result wrapper for fallible operations.
 * Forces explicit error handling at call sites instead of throwing.
 */
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
}

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Run an async producer and normalise thrown errors into a Result.
 */
export async function attempt<T>(
  fn: () => Promise<T> | T,
  code = "UNKNOWN",
): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (cause) {
    return err({
      code,
      message: cause instanceof Error ? cause.message : "Unexpected error",
      cause,
    });
  }
}
