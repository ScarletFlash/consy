import { NonParameterizableCommand } from './non-parameterizable-command';
import { ParameterizableCommand } from './parameterizable-command';

export type CommandDefinition = NonParameterizableCommand | ParameterizableCommand;
