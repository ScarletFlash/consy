import { CommandParamDefinition, CommandParamDefinitionBase } from '@consy/declarations';
import { isEmptyObject } from './is-empty-object';

export function isCommandParamDefinition(rawParamDefinition: unknown): rawParamDefinition is CommandParamDefinition {
  if (typeof rawParamDefinition !== 'object' || rawParamDefinition === null || isEmptyObject(rawParamDefinition)) {
    return false;
  }

  const paramsDefinition: Partial<CommandParamDefinitionBase> = rawParamDefinition;
  return ('type' satisfies keyof CommandParamDefinitionBase) in paramsDefinition;
}
