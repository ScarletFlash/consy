import { CommandDefinitionBase } from './command-definition-base.type';

export type NonParameterizableCommand = CommandDefinitionBase<() => void>;
