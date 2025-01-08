import { CommandParamsDefinition } from '@consy/declarations';
import { isCommandParamsDefinition, isEmptyObject } from '@consy/utilities';
import { ReactNode } from 'react';
import { CommandExecuteButton } from './CommandExecuteButton';
import { CommmandWithParams } from './CommmandWithParams';

interface CommandFormItemProps {
  instanceKey: string;
  commandName: string;
  paramsDefinition: CommandParamsDefinition | {};
}
export function Command({ commandName, instanceKey, paramsDefinition }: CommandFormItemProps): ReactNode {
  if (isEmptyObject(paramsDefinition)) {
    return (
      <CommandExecuteButton
        commandName={commandName}
        instanceKey={instanceKey}
        params={{}}
      />
    );
  }

  if (isCommandParamsDefinition(paramsDefinition)) {
    return (
      <CommmandWithParams
        commandName={commandName}
        instanceKey={instanceKey}
        paramsDefinition={paramsDefinition}
      />
    );
  }

  throw new Error('Unsupported params definition');
}
