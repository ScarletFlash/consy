import { AnyFunction } from './any-function.type';

/** @private */
export type SyncOrAsyncFunction<F extends AnyFunction> = F extends (...args: infer A) => infer R
  ? (...args: A) => R | Promise<R>
  : never;
