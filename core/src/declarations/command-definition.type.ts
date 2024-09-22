import { AnyFunction } from "./any-function.type";
import { SyncOrAsyncFunction } from "./sync-or-async-function.type";

interface CommandDefinitionBase<C extends AnyFunction> {
  name: string;
  description: string;

  callback: SyncOrAsyncFunction<C>;
}

export type CommandDefinition = CommandDefinitionBase<() => void>;
