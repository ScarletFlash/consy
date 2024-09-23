import { CommandDefinitionBase } from './command-definition-base';
import { CommandParams } from './command-param-definition-type';
import { CommandParamsDefinition } from './command-params-definition';

export interface ParameterizableCommand<P extends CommandParamsDefinition = CommandParamsDefinition>
  extends CommandDefinitionBase<(params: CommandParams<P>) => void> {
  readonly params: P;
}
