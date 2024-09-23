import { CommandParamDefinitionBase } from './command-param-definition-base';
import { CommandParamType } from './command-param-type';
import { CommandParamsDefinition } from './command-params-definition';

type CommandParamDefinitionType<T extends CommandParamDefinitionBase> = T['type'];
export type CommandParams<P extends CommandParamsDefinition = CommandParamsDefinition> = {
  [K in keyof P]: CommandParamDefinitionType<P[K]> extends CommandParamType.String
    ? string
    : CommandParamDefinitionType<P[K]> extends CommandParamType.Toggle
      ? boolean
      : CommandParamDefinitionType<P[K]> extends CommandParamType.Select
        ? string[]
        : never;
};
