import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

const mountedInstancesByTabId: Map<number, MountedInstance[]> = new Map<number, MountedInstance[]>();

const enum MessageSource {
  Extension = 'extension',
  ContentScript = 'content-script'
}

async function getActiveTabId(): Promise<number | undefined> {
  return new Promise((resolve: (value: number | undefined) => void) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      resolve(tabs[0]?.id);
    });
  });
}

chrome.runtime.onMessage.addListener((data: unknown, sender: chrome.runtime.MessageSender): undefined => {
  if (!MessageBase.isMessageData(data)) {
    return;
  }

  const messageSource: MessageSource = sender.tab === undefined ? MessageSource.Extension : MessageSource.ContentScript;

  (async () => {
    const activeTabId: number | undefined = await getActiveTabId();

    if (activeTabId === undefined) {
      return;
    }

    if (messageSource === MessageSource.Extension) {
      chrome.tabs.sendMessage(activeTabId, data);
    }

    if (UpdateRequiredMessage.isMessageData(data)) {
      chrome.runtime.sendMessage(new MountedInstancesMessage(mountedInstancesByTabId.get(activeTabId) ?? []));
      return;
    }

    if (MountedInstancesMessage.isMessageData(data) && messageSource === MessageSource.ContentScript) {
      mountedInstancesByTabId.set(activeTabId, data.payload);
      chrome.runtime.sendMessage(new MountedInstancesMessage(data.payload));
      return;
    }
  })();
});

chrome.tabs.onRemoved.addListener((tabId: number) => {
  mountedInstancesByTabId.delete(tabId);
});
