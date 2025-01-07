import { CommandParamDefinitionBase, CommandParamsDefinition } from '@consy/declarations';
import { isEmptyObject } from './is-empty-object';

export function isCommandParamsDefinition(
  rawParamsDefinition: NonNullable<object>
): rawParamsDefinition is CommandParamsDefinition {
  if (isEmptyObject(rawParamsDefinition)) {
    return true;
  }

  return Object.values(rawParamsDefinition).every((rawParamsDefinition: unknown) => {
    if (typeof rawParamsDefinition !== 'object' || rawParamsDefinition === null || isEmptyObject(rawParamsDefinition)) {
      return false;
    }

    const paramsDefinition: Partial<CommandParamDefinitionBase> = rawParamsDefinition;
    return ('type' satisfies keyof CommandParamDefinitionBase) in paramsDefinition;
  });
}
