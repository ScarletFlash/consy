import { Acessor, EXPOSED_KEYS_PROPERTY_NAME } from '@consy/declarations';
import { MountedInstancesMessage } from './communication/messages/mounted-instances.message';

const windowAccessor: Acessor<unknown, typeof EXPOSED_KEYS_PROPERTY_NAME> = new Acessor(window);
(() => {
  if (!windowAccessor.isMounted(EXPOSED_KEYS_PROPERTY_NAME)) {
    window.postMessage(new MountedInstancesMessage([]), '*');
    return;
  }

  const exposedKeys: unknown = windowAccessor.getValue(EXPOSED_KEYS_PROPERTY_NAME);
  if (!Array.isArray(exposedKeys) || exposedKeys.some((key: unknown) => typeof key !== 'string')) {
    throw new Error('Exposed keys are mounted, but the value is not of expected type');
  }

  window.postMessage(new MountedInstancesMessage(exposedKeys.map((key: string) => ({ key }))), '*');
})();
