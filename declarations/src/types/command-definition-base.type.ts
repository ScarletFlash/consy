import { AnyFunction } from './any-function.type';
import { SyncOrAsyncFunction } from './sync-or-async-function.type';

export interface CommandDefinitionBase<C extends AnyFunction> {
  readonly name: string;
  readonly description: string;

  readonly callback: SyncOrAsyncFunction<C>;
}
