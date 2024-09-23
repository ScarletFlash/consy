import { CommandParamDefinitionBase } from './command-param-definition-base';
import { CommandParamType } from './command-param-type';

type StringParamDefinition = CommandParamDefinitionBase<CommandParamType.String>;

interface ToggleParamDefinition extends CommandParamDefinitionBase<CommandParamType.Toggle> {
  readonly isEnabledByDefault: boolean;
}

interface SelectParamDefinition extends CommandParamDefinitionBase<CommandParamType.Select> {
  readonly isMultipleChoiceAllowed: boolean;
  readonly options: ReadonlyArray<string>;
}

export type CommandParamDefinition<T extends CommandParamType = CommandParamType> = T extends CommandParamType.String
  ? StringParamDefinition
  : T extends CommandParamType.Toggle
    ? ToggleParamDefinition
    : T extends CommandParamType.Select
      ? SelectParamDefinition
      : never;
