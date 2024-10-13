import { Acessor, EXPOSED_KEYS_PROPERTY_NAME } from '@consy/declarations';
import { MessageBus } from './communication/message-bus';
import { MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { NotMountedMessage } from './communication/messages/not-mounted.message';

const messageBus: MessageBus = new MessageBus();

(() => {
  const exposedKeysAccessor: Acessor<string[], string> = new Acessor<string[], string>(window);
  if (!exposedKeysAccessor.isMounted(EXPOSED_KEYS_PROPERTY_NAME)) {
    messageBus.publish(new NotMountedMessage());
    return;
  }
  const exposedKeys: string[] = exposedKeysAccessor.getValue(EXPOSED_KEYS_PROPERTY_NAME);
  messageBus.publish(new MountedInstancesMessage(exposedKeys.map((key: string) => ({ key }))));
})();
