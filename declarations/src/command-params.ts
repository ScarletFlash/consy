import { CommandParamDefinitionBase } from './command-param-definition-base';
import { CommandParamType } from './command-param-type';
import { CommandParamsDefinition } from './command-params-definition';

type CommandParamDefinitionType<T extends CommandParamDefinitionBase> = T['type'];

export type CommandParams<D extends CommandParamsDefinition = CommandParamsDefinition> = {
  [K in keyof D]: CommandParamDefinitionType<D[K]> extends CommandParamType.String
    ? string
    : CommandParamDefinitionType<D[K]> extends CommandParamType.Toggle
      ? boolean
      : CommandParamDefinitionType<D[K]> extends CommandParamType.Select
        ? string[]
        : never;
};
