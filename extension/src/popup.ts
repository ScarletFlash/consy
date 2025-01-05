import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

const cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler().provide<MountedInstancesMessage>(
  MountedInstancesMessage.type,
  (payload) => {
    const isMounted: boolean = payload.length !== 0;

    isMounted ? showMountedPlaceholder() : showNotMountedPlaceholder();

    const mountedKeysSection = document.createElement('section');
    mountedKeysSection.innerText = JSON.stringify(payload);
    document.body.appendChild(mountedKeysSection);
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

function showMountedPlaceholder(): void {
  const container: HTMLElement = getContainer();

  const placeholder: HTMLElement = document.createElement('section');
  placeholder.className = 'flex items-center justify-center h-full text-green-500';
  placeholder.innerText = 'Consy is mounted';

  container.replaceChildren(placeholder);
}
