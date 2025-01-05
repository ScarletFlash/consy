import { MessageBase } from './communication/message-base';
import { MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

const mountedInstanceKeysByTabId: Map<number, string[]> = new Map<number, string[]>();

chrome.runtime.onMessage.addListener((data: unknown, sender: chrome.runtime.MessageSender): undefined => {
  if (!MessageBase.isMessageData(data)) {
    return;
  }

  const tabId = sender.tab?.id;

  if (UpdateRequiredMessage.isMessageData(data)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const activeTabId: number | undefined = tabs[0]?.id;
      if (activeTabId === undefined) {
        return;
      }

      const activeTabInstanceKeys: string[] = mountedInstanceKeysByTabId.get(activeTabId) ?? [];
      chrome.runtime.sendMessage(new MountedInstancesMessage(activeTabInstanceKeys.map((key: string) => ({ key }))));
    });
  }

  if (MountedInstancesMessage.isMessageData(data) && tabId) {
    mountedInstanceKeysByTabId.set(
      tabId,
      data.payload.map(({ key }) => key)
    );
    chrome.runtime.sendMessage(new MountedInstancesMessage(data.payload));
  }
});

chrome.tabs.onRemoved.addListener((tabId: number) => {
  mountedInstanceKeysByTabId.delete(tabId);
});
