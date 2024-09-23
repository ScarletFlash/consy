import { AnyFunction } from './any-function';
import { SyncOrAsyncFunction } from './sync-or-async-function';

export interface CommandDefinitionBase<C extends AnyFunction> {
  readonly name: string;
  readonly description: string;

  readonly callback: SyncOrAsyncFunction<C>;
}
