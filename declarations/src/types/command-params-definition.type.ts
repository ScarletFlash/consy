import { CommandParamDefinition } from './command-param-definition.type';

export interface CommandParamsDefinition {
  readonly [key: string]: CommandParamDefinition;
}
