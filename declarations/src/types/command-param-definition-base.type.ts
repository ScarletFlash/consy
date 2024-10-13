import { CommandParamType } from './command-param-type.type';

export interface CommandParamDefinitionBase<T extends CommandParamType = CommandParamType> {
  readonly type: T;
}
