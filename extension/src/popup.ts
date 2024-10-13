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
