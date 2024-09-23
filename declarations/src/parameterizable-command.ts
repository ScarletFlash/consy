import { CommandDefinitionBase } from './command-definition-base';
import { CommandParams } from './command-params';
import { CommandParamsDefinition } from './command-params-definition';

export interface ParameterizableCommand<D extends CommandParamsDefinition = CommandParamsDefinition>
  extends CommandDefinitionBase<(params: CommandParams<D>) => void> {
  readonly params: D;
}
