import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';

const cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler().provide<MountedInstancesMessage>(
  MountedInstancesMessage.type,
  (instances: MountedInstance[]) => {
    chrome.runtime.sendMessage(new MountedInstancesMessage(instances));
  }
);

chrome.runtime.onMessage.addListener((data: unknown): undefined => {
  if (!MessageBase.isMessageData(data)) {
    return;
  }

  window.postMessage(data, '*');
});

window.addEventListener('message', ({ data }: MessageEvent<unknown>) => {
  if (!MessageBase.isMessageData(data)) {
    return;
  }
  cumulativeHandler.handle(data);
});

const script = document.createElement('script');
script.src = chrome.runtime.getURL('injectable-content-script.js');
(document.head ?? document.documentElement).appendChild(script);
