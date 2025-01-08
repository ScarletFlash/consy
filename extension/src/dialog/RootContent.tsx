import { CommandParamDefinition } from '@consy/declarations';
import { Dispatch, ReactNode, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { CumulativeMessageHandler } from '../communication/cumulative-message-handler';
import { MessageBase } from '../communication/message-base';
import { MountedInstance, MountedInstancesMessage } from '../communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from '../communication/messages/update-required.message';
import { CommandFormItem } from './components/CommandFormItem';

interface RootContentState {
  mountedInstances: MountedInstance[];
}
export function RootContent(): ReactNode {
  const cumulativeHandler: RefObject<CumulativeMessageHandler> = useRef(new CumulativeMessageHandler());

  const [state, setState]: [RootContentState, Dispatch<SetStateAction<RootContentState>>] = useState<RootContentState>({
    mountedInstances: []
  });

  const isMounted: boolean = useMemo(() => state.mountedInstances.length !== 0, [state.mountedInstances]);

  useEffect(() => {
    cumulativeHandler.current.provide<MountedInstancesMessage>(
      MountedInstancesMessage.type,
      (mountedInstances: MountedInstance[]) => {
        setState((previousState: RootContentState) => ({
          ...previousState,
          mountedInstances
        }));

        // mountedInstances.length === 0
        //   ? showNotMountedPlaceholder()
        //   : showMountedInstancesInteractiveForm(mountedInstances);
      }
    );

    chrome.runtime.onMessage.addListener((data: unknown): undefined => {
      if (!MessageBase.isMessageData(data)) {
        return;
      }
      cumulativeHandler.current.handle(data);
    });

    chrome.runtime.sendMessage(new UpdateRequiredMessage());
  }, []);

  if (!isMounted) {
    return (
      <>
        <section className="flex items-center justify-center size-full text-red-500">
          <h1>Consy is not mounted</h1>
        </section>
      </>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center">
      {state.mountedInstances.map(({ commands, key: instanceKey }: MountedInstance) => {
        return Object.entries(commands).map(
          ([commandName, paramsDefinition]: [string, {} | CommandParamDefinition]) => {
            return (
              <CommandFormItem
                key={`${instanceKey}:${commandName}`}
                instanceKey={instanceKey}
                paramsDefinition={paramsDefinition}
                commandName={commandName}
              />
            );
          }
        );
      })}
    </section>
  );
}
