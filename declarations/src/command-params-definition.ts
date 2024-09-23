import { CommandParamDefinition } from './command-param-definition';

export interface CommandParamsDefinition {
  readonly [key: string]: CommandParamDefinition;
}
