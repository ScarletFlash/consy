import { Acessor, EXPOSED_INFO_PROPERTY_NAME } from '@consy/declarations';
import { isEmptyObject, isExposedInfo, isKeyInObject } from '@consy/utilities';
import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { RequestedCommand, RequestedCommandMessage } from './communication/messages/requested-command.message';

const windowAccessor: Acessor<unknown, typeof EXPOSED_INFO_PROPERTY_NAME | string> = new Acessor(window);

(() => {
  if (!windowAccessor.isMounted(EXPOSED_INFO_PROPERTY_NAME)) {
    window.postMessage(new MountedInstancesMessage([]), '*');
    return;
  }

  const exposedInfo: unknown = windowAccessor.getValue(EXPOSED_INFO_PROPERTY_NAME);
  if (!isExposedInfo(exposedInfo)) {
    throw new Error('Consy ExposedInfo is not mounted correctly');
  }

  const mountedInstances: MountedInstance[] = Object.entries(exposedInfo).map(([key, commands]) => ({ key, commands }));
  window.postMessage(new MountedInstancesMessage(mountedInstances), '*');

  const cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler().provide<RequestedCommandMessage>(
    RequestedCommandMessage.type,
    ({ instanceKey, name, params }: RequestedCommand) => {
      const instance: unknown = windowAccessor.getValue(instanceKey);
      if (typeof instance !== 'object' || instance === null || isEmptyObject(instance)) {
        throw new Error(`Instance with the key == ${instanceKey} is unaccessible.`);
      }

      if (!isKeyInObject(name, instance)) {
        throw new Error(`Command with the name == ${name} is unaccessible.`);
      }

      const targetCommandCallback: unknown = instance[name];
      if (typeof targetCommandCallback !== 'function') {
        throw new Error(`Command with the name == ${name} is not a function.`);
      }

      targetCommandCallback(params);
    }
  );

  window.addEventListener('message', ({ data }: MessageEvent<unknown>) => {
    if (!MessageBase.isMessageData(data)) {
      return;
    }

    console.log({ data });
    cumulativeHandler.handle(data);
  });
})();
