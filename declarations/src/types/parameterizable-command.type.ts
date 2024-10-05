import { CommandDefinitionBase } from './command-definition-base.type';
import { CommandParams } from './command-params.type';
import { CommandParamsDefinition } from './command-params-definition.type';

export interface ParameterizableCommand<D extends CommandParamsDefinition = CommandParamsDefinition>
  extends CommandDefinitionBase<(params: CommandParams<D>) => void> {
  readonly params: D;
}
