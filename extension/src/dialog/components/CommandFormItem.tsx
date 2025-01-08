import { CommandParamDefinition } from '@consy/declarations';
import { ReactNode } from 'react';
import { RequestedCommandMessage } from '../../communication/messages/requested-command.message';

interface CommandFormItemProps {
  instanceKey: string;
  commandName: string;
  paramsDefinition: CommandParamDefinition | {};
}
export function CommandFormItem({ commandName, instanceKey }: CommandFormItemProps): ReactNode {
  return (
    <section>
      <button
        className="p-2 m-2 border border-gray-300 rounded-md"
        onClick={() => {
          chrome.runtime.sendMessage(
            new RequestedCommandMessage({
              instanceKey,
              name: commandName,
              params: {}
            })
          );
        }}
      >
        {commandName}
      </button>
    </section>
  );
}
