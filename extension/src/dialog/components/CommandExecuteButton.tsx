import { CommandDefinition, ParameterizableCommand } from '@consy/declarations';
import { Button } from '@headlessui/react';
import { ReactNode } from 'react';
import { RequestedCommandMessage } from '../../communication/messages/requested-command.message';

interface CommandExecuteButtonProps<D extends CommandDefinition> {
  instanceKey: string;
  commandName: D['name'];
  params: D extends ParameterizableCommand<infer P> ? P : {};
}

export function CommandExecuteButton<D extends CommandDefinition>({
  instanceKey,
  commandName,
  params
}: CommandExecuteButtonProps<D>): ReactNode {
  return (
    <Button
      className="rounded w-full bg-slate-600 py-2 px-4 text-sm text-white data-[hover]:bg-slate-500 data-[active]:bg-slate-700"
      onClick={() => {
        chrome.runtime.sendMessage(
          new RequestedCommandMessage({
            instanceKey,
            name: commandName,
            params
          })
        );
      }}
    >
      {commandName}
    </Button>
  );
}
