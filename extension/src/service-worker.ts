import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

const mountedInstancesByTabId: Map<number, MountedInstance[]> = new Map<number, MountedInstance[]>();

const enum MessageSource {
  Extension = 'extension',
  ContentScript = 'content-script'
}

class ServiceWorker {
  private isInitialized: boolean = false;

  private get activeTabId(): Promise<number | undefined> {
    try {
      return new Promise((resolve: (value: number | undefined) => void) => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]: chrome.tabs.Tab[]) => {
          resolve(currentTab?.id);
        });
      });
    } catch (error: unknown) {
      console.error('Failed to get the ID of the active tab ― considering it as undefined', error);
      return Promise.resolve(undefined);
    }
  }

  public initialize(): void {
    if (this.isInitialized) {
      return;
    }
    this.setupListeners();

    this.isInitialized = true;
  }

  private setupListeners(): void {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const { tabId } = activeInfo;

        try {
          const instances = mountedInstancesByTabId.get(tabId) || [];
          await chrome.runtime.sendMessage(new MountedInstancesMessage(instances));
        } catch (error) {}

        await this.requestUpdatedTabInfo(tabId);
      } catch (error) {
        console.error('Error handling tab activation:', error);
      }
    });

    chrome.tabs.onUpdated.addListener((tabId: number, changeInfo) => {
      if (changeInfo.status !== 'complete') {
        return;
      }
      this.requestUpdatedTabInfo(tabId);
    });

    chrome.tabs.onRemoved.addListener((tabId: number) => {
      mountedInstancesByTabId.delete(tabId);
    });

    chrome.runtime.onMessage.addListener((data: unknown, sender: chrome.runtime.MessageSender) => {
      if (!MessageBase.isMessageData(data)) {
        return;
      }

      const messageSource: MessageSource =
        sender.tab === undefined ? MessageSource.Extension : MessageSource.ContentScript;
      const senderTabId: number | undefined = sender.tab?.id;

      (async () => {
        try {
          const activeTabId: number | undefined = await this.activeTabId;
          if (activeTabId === undefined) {
            return;
          }

          if (messageSource === MessageSource.Extension && UpdateRequiredMessage.isMessageData(data)) {
            const instances: MountedInstance[] = mountedInstancesByTabId.get(activeTabId) ?? [];
            await chrome.runtime.sendMessage(new MountedInstancesMessage(instances));
            await this.requestUpdatedTabInfo(activeTabId);
          }

          if (
            messageSource === MessageSource.ContentScript &&
            senderTabId !== undefined &&
            MountedInstancesMessage.isMessageData(data)
          ) {
            mountedInstancesByTabId.set(senderTabId, data.payload);

            if (senderTabId === activeTabId) {
              await chrome.runtime.sendMessage(new MountedInstancesMessage(data.payload));
            }
          }
        } catch (error) {
          console.error('Error handling runtime message:', error);
        }
      })();

      return true;
    });
  }

  private async requestUpdatedTabInfo(tabId: number): Promise<void> {
    const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({});

    const isExistingTab: boolean = tabs.some((tab: chrome.tabs.Tab) => tab.id === tabId);
    if (!isExistingTab) {
      mountedInstancesByTabId.delete(tabId);
      return;
    }

    try {
      await chrome.tabs.sendMessage(tabId, new UpdateRequiredMessage());
    } catch (error) {
      console.error('Error sending update required message:', error);
    }
  }
}

new ServiceWorker().initialize();
