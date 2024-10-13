import { MessageBus } from './communication/message-bus';
import { MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { NotMountedMessage } from './communication/messages/not-mounted.message';

const messageBus: MessageBus = new MessageBus();

messageBus.subscribe((messageData: unknown) => {
  switch (true) {
    case NotMountedMessage.isMessageData(messageData): {
      console.log('Not mounted');
      return;
    }

    case MountedInstancesMessage.isMessageData(messageData): {
      console.log(messageData.payload);
      return;
    }

    default: {
      return;
    }
  }
});

try {
  chrome.tabs.onUpdated.addListener(
    async (
      tabId: number,
      changeInfo: {
        status?: chrome.tabs.TabStatus;
      },
      tab: chrome.tabs.Tab
    ) => {
      if (changeInfo.status !== 'complete' || tab.url === undefined) {
        return;
      }

      if (tabId === undefined) {
        throw new Error('No active tab ID found');
      }

      const [injectionResult]: chrome.scripting.InjectionResult[] = await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['injected-script.js']
      });

      if (injectionResult === undefined) {
        throw new Error('Script injection failed');
      }
    }
  );
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : 'Unknown error');
}
