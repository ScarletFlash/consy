import { CommandDefinition, ParameterizableCommand } from '@consy/declarations';

const REQUIRED_KEYS: string[] = [
  'name',
  'description',
  'callback',
  'params'
] satisfies (keyof ParameterizableCommand)[];

export function isParameterizableCommand(
  commandDefinition: CommandDefinition
): commandDefinition is ParameterizableCommand {
  return REQUIRED_KEYS.every((key: string) => key in commandDefinition);
}
