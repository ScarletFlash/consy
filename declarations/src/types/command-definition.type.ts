import { NonParameterizableCommand } from './non-parameterizable-command.type';
import { ParameterizableCommand } from './parameterizable-command.type';

export type CommandDefinition = NonParameterizableCommand | ParameterizableCommand;
