import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstancesMessage } from './communication/messages/mounted-instances.message';

const cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler().provide<MountedInstancesMessage>(
  MountedInstancesMessage.type,
  (payload) => {
    chrome.runtime.sendMessage(new MountedInstancesMessage(payload));
  }
);

window.addEventListener('message', ({ data }: MessageEvent<unknown>) => {
  if (!MessageBase.isMessageData(data)) {
    return;
  }
  cumulativeHandler.handle(data);
});

const script = document.createElement('script');
script.src = chrome.runtime.getURL('injectable-content-script.js');
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();
