import { CommandDefinitionBase } from './command-definition-base';

export type NonParameterizableCommand = CommandDefinitionBase<() => void>;
