import { CommandParamsDefinition } from '@consy/declarations';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Dispatch, ReactNode, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { CumulativeMessageHandler } from '../communication/cumulative-message-handler';
import { MessageBase } from '../communication/message-base';
import { MountedInstance, MountedInstancesMessage } from '../communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from '../communication/messages/update-required.message';
import { Command } from './components/Command';

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
    <TabGroup className="w-full flex flex-col gap-4 bg-gray-900">
      {state.mountedInstances.length === 1 ? null : (
        <TabList className="flex gap-1">
          {state.mountedInstances.map(({ key: instanceKey }: MountedInstance) => (
            <Tab
              key={instanceKey}
              className="rounded-full py-1 px-3 text-sm/6 font-semibold text-white focus:outline-none data-[selected]:bg-white/10 data-[hover]:bg-white/5 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white"
            >
              {instanceKey}
            </Tab>
          ))}
        </TabList>
      )}

      <TabPanels className="w-full flex flex-col gap-4">
        {state.mountedInstances.map(({ key: instanceKey, commands }: MountedInstance) => (
          <TabPanel
            key={instanceKey}
            className="w-full"
          >
            <ul className="flex flex-col gap-6 bg-white/5">
              {Object.entries(commands)
                .sort(
                  (
                    [commandNameA]: [string, {} | CommandParamsDefinition],
                    [commandNameB]: [string, {} | CommandParamsDefinition]
                  ) => commandNameA.localeCompare(commandNameB)
                )
                .map(([commandName, paramsDefinition]: [string, {} | CommandParamsDefinition]) => (
                  <li
                    key={commandName}
                    className="transition hover:bg-white/5 p-3"
                  >
                    <Command
                      instanceKey={instanceKey}
                      paramsDefinition={paramsDefinition}
                      commandName={commandName}
                    ></Command>
                  </li>
                ))}
            </ul>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
