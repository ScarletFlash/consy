import { Acessor, EXPOSED_INFO_PROPERTY_NAME } from '@consy/declarations';
import { isEmptyObject, isExposedInfo, isKeyInObject } from '@consy/utilities';
import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { RequestedCommand, RequestedCommandMessage } from './communication/messages/requested-command.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

class InjectableContentScript {
  private static readonly noInstancesCheckString: '' = '';
  private static readonly debounceTimeMs: number = 100;

  private debounceTimeoutId: number | null = null;

  private lastInstancesCheckString: string = InjectableContentScript.noInstancesCheckString;

  private readonly windowAccessor: Acessor<unknown, typeof EXPOSED_INFO_PROPERTY_NAME | string> = new Acessor(window);

  private readonly mutationObserver: MutationObserver;

  constructor() {
    this.mutationObserver = new MutationObserver(() => {
      this.debouncedSendMountedInstances();
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  public initialize(): void {
    this.publishMountedInstances();

    const cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler()
      .provide<RequestedCommandMessage>(
        RequestedCommandMessage.type,
        ({ instanceKey, name, params }: RequestedCommand) => {
          const instance: unknown = this.windowAccessor.getValue(instanceKey);
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
          this.debouncedSendMountedInstances();
        }
      )
      .provide<UpdateRequiredMessage>(UpdateRequiredMessage.type, () => {
        this.publishMountedInstances();
      });

    window.addEventListener('message', ({ data }: MessageEvent) => {
      if (!MessageBase.isMessageData(data)) {
        return;
      }

      cumulativeHandler.handle(data);
    });

    new Set<keyof WindowEventMap>(['load', 'popstate', 'hashchange']).forEach((eventName: keyof WindowEventMap) => {
      window.addEventListener(eventName, () => this.debouncedSendMountedInstances());
    });
  }

  private publishMountedInstances(): void {
    if (this.debounceTimeoutId !== null) {
      window.clearTimeout(this.debounceTimeoutId);
      this.debounceTimeoutId = null;
    }

    if (
      !this.windowAccessor.isMounted(EXPOSED_INFO_PROPERTY_NAME) &&
      this.lastInstancesCheckString !== InjectableContentScript.noInstancesCheckString
    ) {
      this.lastInstancesCheckString = InjectableContentScript.noInstancesCheckString;
      window.postMessage(new MountedInstancesMessage([]), '*');
      return;
    }

    const exposedInfo: unknown = this.windowAccessor.getValue(EXPOSED_INFO_PROPERTY_NAME);
    if (!isExposedInfo(exposedInfo)) {
      throw new Error('Consy ExposedInfo is not mounted correctly');
    }

    const mountedInstances = Object.entries(exposedInfo).map(([key, commands]) => ({ key, commands }));
    const instancesCheckString = InjectableContentScript.getInstancesCheckString(mountedInstances);

    if (instancesCheckString === this.lastInstancesCheckString) {
      return;
    }
    this.lastInstancesCheckString = instancesCheckString;
    window.postMessage(new MountedInstancesMessage(mountedInstances), '*');
  }

  private debouncedSendMountedInstances(): void {
    if (this.debounceTimeoutId !== null) {
      window.clearTimeout(this.debounceTimeoutId);
    }

    this.debounceTimeoutId = window.setTimeout(() => {
      this.publishMountedInstances();
      this.debounceTimeoutId = null;
    }, InjectableContentScript.debounceTimeMs);
  }

  private static getInstancesCheckString(instances: MountedInstance[]): string {
    return instances
      .map(({ key }: MountedInstance) => key)
      .sort()
      .join(',');
  }
}

new InjectableContentScript().initialize();
