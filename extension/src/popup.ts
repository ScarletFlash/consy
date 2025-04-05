import { CommandParamDefinition } from '@consy/declarations';
import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { RequestedCommandMessage } from './communication/messages/requested-command.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

const cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler().provide<MountedInstancesMessage>(
  MountedInstancesMessage.type,
  (mountedInstances: MountedInstance[]) => {
    mountedInstances.length === 0 ? showNotMountedPlaceholder() : showMountedInstancesInteractiveForm(mountedInstances);
  }
);

chrome.runtime.onMessage.addListener((data: unknown): undefined => {
  if (!MessageBase.isMessageData(data)) {
    return;
  }
  cumulativeHandler.handle(data);
});

chrome.runtime.sendMessage(new UpdateRequiredMessage());

function getContainer(): HTMLElement {
  const container: HTMLElement | null = document.querySelector('body > main');
  if (container === null) {
    throw new Error('No container found');
  }
  return container;
}

function showNotMountedPlaceholder(): void {
  const container: HTMLElement = getContainer();

  const placeholder: HTMLElement = document.createElement('section');
  placeholder.className = 'flex items-center justify-center h-full text-red-500';
  placeholder.innerText = 'Consy is not mounted';

  container.replaceChildren(placeholder);
}

function showMountedInstancesInteractiveForm(mountedInstances: MountedInstance[]): void {
  const container: HTMLElement = getContainer();

  container.replaceChildren(
    ...mountedInstances.map(({ commands, key: instanceKey }: MountedInstance) => {
      const controls: HTMLElement = document.createElement('section');
      controls.className = 'flex flex-col items-center justify-center';

      Object.entries(commands).forEach(([commandName, _commandDefinition]: [string, {} | CommandParamDefinition]) => {
        const executeCommandButton: HTMLButtonElement = document.createElement('button');
        executeCommandButton.className = 'p-2 m-2 border border-gray-300 rounded-md';
        executeCommandButton.innerText = commandName;
        executeCommandButton.onclick = () => {
          chrome.runtime.sendMessage(
            new RequestedCommandMessage({
              instanceKey,
              name: commandName,
              params: {}
            })
          );
        };
        controls.appendChild(executeCommandButton);
      });

      return controls;
    })
  );
}
