import { CommandParamsDefinition } from '@consy/declarations';
import { isCommandParamDefinition } from './is-command-param-definition';
import { isEmptyObject } from './is-empty-object';

export function isCommandParamsDefinition(
  rawParamsDefinition: NonNullable<object>
): rawParamsDefinition is CommandParamsDefinition {
  if (isEmptyObject(rawParamsDefinition)) {
    return true;
  }

  return Object.values(rawParamsDefinition).every((rawParamDefinition: unknown) =>
    isCommandParamDefinition(rawParamDefinition)
  );
}
