/**
 * Type used throughout our application to represent some kind of error or failure,
 * for example the result of a non-OK HTTP response.
 *
 * The advantage of this is that it's very simple. The disadvantage is that it sometimes
 * can be a bit confusing to use the same error type everywhere; e.g. when you make a
 * request to an upstream REST API (e.g. OpenAI) we make the call return one kind of AppError, but
 * you then need to convert it to a different kind for returning the JSON from our own REST API.
 * For better or worse, this mirrors both `fetch` and `Astro.APIRoute` using the same
 * `Response` interface.
 */
export interface AppError<S extends string = string> {
  /** The Error that caused this AppError, if any. */
  cause?: Error;

  /** Short English debug string, ideally a string literal */
  error: S;

  /** Human-readable message, potentially localized */
  message?: string;

  /** just here for TypeScript to distinguish the different `Result<T>` types */
  ok: undefined;

  /** HTTP status code, if available */
  statusCode?: number;
}

/**
 * `Result<T, E>` (sometimes known as `Either<T, E>`) is a generic type that is either
 * something of type `T` in case of success, or of type `E` (usually an `AppError`) in case of an error or failure.
 * Use it for failures which are both expected and recoverable (e.g. IO).
 *
 * See e.g. https://imhoff.blog/posts/using-results-in-typescript
 * or https://blog.logrocket.com/pattern-matching-and-type-safety-in-typescript-1da1231a2e34/
 *
 * This implementation is a minimal take on https://github.com/vultix/ts-results
 *
 * Usage:
 * ```
 * const res = Math.random()
 *   ? Ok('here is our result')
 *   : Err('oh noes')
 *
 * if (res.ok) {
 *   console.info(res.val)
 * } else {
 *   console.error(res.error)
 * }
 * ```
 */
export type Result<T, E=AppError> = { ok: true; val: T } | E

/**
 * Ok constructor
 */
export const Ok = <T>(val: T): Result<T> =>
  ({ ok: true, val })

/**
 * AppError constructor
 */
export const Err = <S extends string = string>(
  error: S,
  statusCode?: number,
  message?: string,
  cause?: Error,
): AppError<S> => ({ error, message, ok: undefined, statusCode, cause })

/**
 * Runs the provided function that may throw and converts it to a `Result<T>`.
 */
export const catchFn = <T>(fn: () => T): Result<T> => {
  try {
    return Ok(fn())
  } catch (e) {
    return toAppError(e)
  }
}

/**
 * Takes a `Promise<T>` that may throw/reject and converts it to a `Result<T>`.
 */
export const catchPromise = async <T>(
  promise: Promise<T>,
): Promise<Result<T>> => {
  try {
    return Ok(await promise)
  } catch (e) {
    return toAppError(e)
  }
}

/**
 * Removes all values of an object that were `null`.
 */
export const setNullsToUndefined = <T extends object>(obj: T): {
  [K in keyof T]: null extends T[K] ? (NonNullable<T[K]> | undefined) : T[K]
} => {
  for (const key in obj) {
    if (obj[key] === null) {
      delete obj[key]
    }
  }
  return obj as any
}

export const nonNullable = <T>(val: T | undefined | null): val is T =>
  val !== undefined && val !== null

/**
 * Converts the contained value to an AppError if it was `undefined` or `null`.
 */
export const nonNullableResult = <T>(res: Result<T>): Result<NonNullable<T>> =>
  res.ok
    ? nonNullable(res.val) ? res as Result<NonNullable<T>> : Err('Not found', 404)
    : res

/**
 * Extracts all `T`s from an array of `Result<T>`s.
 */
export const filterOks = <T>(arr: Result<T>[]): T[] =>
  arr.reduce((acc, res) => {
    if (res.ok) acc.push(res.val)
    return acc
  }, [] as T[])

/**
 * Converts an unknown object (presumably an `Error`) into an `AppError`.
 */
export const toAppError = (e: unknown) => {
  const cause = e instanceof Error ? e : undefined
  return Err(`${e}`, undefined, undefined, cause)
}

/**
 * Takes a function and promotes it to work on an Ok.
 */
export const liftOk = <T, R>(
  fn: (el: T) => R,
): (el: Result<T>) => Result<R> =>
    el => el.ok ? Ok(fn(el.val)) : el

/**
 * `mapResult(res, fn)` applies the function `fn` to an Ok value contained in `res`, leaving an AppError untouched.
 *
 * Example:
 * ```
 * mapResult(Ok(10), n => n+1) === Ok(11)
 * mapResult(Err('noes'), n => n+1) === Err('noes')
 * mapResult(Ok(10), flow(n => n+1, JSON.stringify)) === Ok('11')
 * ```
 */
export const mapResult = <A, B>(res: Result<A>, fn: (a: A) => B): Result<B> =>
  liftOk(fn)(res)

export const flattenResult = <T>(res: Result<Result<T>>): Result<T> =>
  res.ok ? res.val : res
