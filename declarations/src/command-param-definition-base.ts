import { CommandParamType } from './command-param-type';

export interface CommandParamDefinitionBase<T extends CommandParamType = CommandParamType> {
  readonly type: T;
}
