import { Err, Ok, type Result } from './result.ts'

/**
 * Async iterables can throw/reject. `catchIterable` converts the iterable's items to `Result<T>`s.
 */
export async function * catchIterable<T> (iter: AsyncIterable<T>): AsyncIterable<Result<T>> {
  try {
    for await (const val of iter) {
      yield Ok(val)
    }
  } catch (e) {
    const status = e instanceof Error && 'code' in e && e.code === '22P02'
      ? 404 // `invalid input syntax for type uuid`, see https://www.postgresql.org/docs/current/errcodes-appendix.html
      : 503
    const cause = e instanceof Error ? e : undefined
    yield Err(`catchIterable ${e}`, status, undefined, cause)
  }
}

/**
 * Maps over an `AsyncIterable`, just like you'd map over an array.
 */
export async function * mapIterable<T, R> (
  iter: AsyncIterable<T>,
  callback: (val: T, index: number) => R,
): AsyncIterable<R> {
  let i = 0
  for await (const val of iter) {
    yield callback(val, i++)
  }
}

/**
 * Filters an `AsyncIterable`, just like you would filter an array.
 */
export function filterIterable<T, S extends T> (
  iter: AsyncIterable<T>,
  predicate: (val: T, index: number) => val is S,
): AsyncIterable<S>
export function filterIterable<T> (
  iter: AsyncIterable<T>,
  predicate: (val: T, index: number) => boolean,
): AsyncIterable<T>
export async function * filterIterable (iter: any, predicate: any) {
  let i = 0
  for await (const val of iter) {
    if (predicate(val, i++)) {
      yield val
    }
  }
}

/**
 * Like
 * [Iterator.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap)
 * but for AsyncIterables.
 */
export async function * flatMapIterable<T, R> (
  iter: AsyncIterable<T>,
  callback: (val: T, index: number) => AsyncIterable<R> | Iterable<R>,
): AsyncIterable<R> {
  let i = 0
  for await (const val of iter) {
    yield * callback(val, i++)
  }
}

export const iterableToArray = async <T>(iter: AsyncIterable<T>): Promise<T[]> => {
  const arr = []
  for await (const val of iter) {
    arr.push(val)
  }
  return arr
}

/**
 * Drains the iterable and returns its last element (or `undefined` if the iterable was empty).
 */
export const drainIterable = async <T>(
  iter: AsyncIterable<T>,
): Promise<T | undefined> => {
  let lastVal
  for await (const val of iter) {
    lastVal = val
  }
  return lastVal
}

/**
 * Returns a pair `[iterator, lastElementPromise]`.
 * The iterator is identical to the one passed in and needs to be consumed for anything to happen.
 */
export const lastElement = <T> (
  iter: AsyncIterable<T>,
): [AsyncIterable<T>, Promise<T | undefined>] => {
  let resolvePromise: (value: T | undefined) => void
  const lastElPromise = new Promise<T | undefined>(resolve => {
    resolvePromise = resolve
  })

  async function * retIter () {
    let lastVal: T | undefined
    for await (const val of iter) {
      lastVal = val
      yield val
    }
    resolvePromise(lastVal)
  }

  return [retIter(), lastElPromise]
}

export async function * concatIterable<T> (...iters: Array<AsyncIterable<T>>): AsyncIterable<T> {
  for (const iter of iters) {
    yield * iter
  }
}

/**
 * Returns an AppError if the iterable is empty, or if already the first element contains an AppError.
 */
export const emptyOrError = async <T>(iter: PeekableAsyncIterable<Result<T>>): Promise<Result<void>> => {
  const nextResult = await iter.peek()
  return nextResult.ok
    ? (nextResult.val.ok ? Ok(undefined) : nextResult.val)
    : nextResult
}

type PeekableAsyncIterable<T> = AsyncIterable<T> & {
  peek: () => Promise<Result<T>>;
}

/**
 * Returns an iterable with a `peek` method, which lets you
 * peek at the next element in the iterable without consuming it.
 */
export const peekable = <T>(iterableIn: AsyncIterable<T>): PeekableAsyncIterable<T> => {
  let nextElPromise = iterableIn[Symbol.asyncIterator]().next()

  const iterableOut = (async function * () {
    let nonEmpty = true
    while (nonEmpty) {
      const result = await nextElPromise
      nonEmpty = !result.done
      if (nonEmpty) {
        nextElPromise = iterableIn[Symbol.asyncIterator]().next()
        yield result.value
      }
    }
  })() as unknown as PeekableAsyncIterable<T>

  iterableOut.peek = async () => {
    const result = await nextElPromise
    return result.done
      ? Err('IterableEmpty', 404)
      : Ok(result.value)
  }

  return iterableOut
}

// deno-lint-ignore no-explicit-any
export const isIterable = <T>(val: any): val is AsyncIterable<T> =>
  val && typeof val[Symbol.asyncIterator] === 'function'

/**
 * Creates an `AsyncIterable<T>` from a `T`.
 *
 * Can be useful if you want to return an `AsyncIterable<Result<T>>`, instead of a `Result<AsyncIterable<Result<T>>>`
 */
export async function * createIterable <T> (value?: T | Promise<T> | AsyncIterable<T>): AsyncIterable<T> {
  if (value) {
    if (isIterable(value)) {
      yield* value
    } else {
      yield value
    }
  }
}

/**
 * Creates an `AsyncIterable<T>` from a `Promise<AsyncIterable<T>>`.
 */
export async function * fromPromiseIterable <T> (promise: Promise<AsyncIterable<T>>): AsyncIterable<T> {
  const value = await promise
  yield * value
}
