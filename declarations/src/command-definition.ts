import { AnyFunction } from "./any-function";
import { SyncOrAsyncFunction } from "./sync-or-async-function";

interface CommandDefinitionBase<C extends AnyFunction> {
  name: string;
  description: string;

  callback: SyncOrAsyncFunction<C>;
}

export type CommandDefinition = CommandDefinitionBase<() => void>;
