import { CumulativeMessageHandler } from './communication/cumulative-message-handler';
import { MessageBase } from './communication/message-base';
import { MountedInstance, MountedInstancesMessage } from './communication/messages/mounted-instances.message';
import { UpdateRequiredMessage } from './communication/messages/update-required.message';

class InjectedContent {
  private latestInstancesState: 'mounted' | 'not-mounted' = 'not-mounted';

  private isInjectedScriptInitialized: boolean = false;
  private isScriptInjectionAttempted: boolean = false;

  private readonly cumulativeHandler: CumulativeMessageHandler = new CumulativeMessageHandler()
    .provide<MountedInstancesMessage>(MountedInstancesMessage.type, (instances: MountedInstance[]) => {
      this.publishInstances(instances);
    })
    .provide<UpdateRequiredMessage>(UpdateRequiredMessage.type, () => {
      if (this.isInjectedScriptInitialized) {
        window.postMessage(new UpdateRequiredMessage(), '*');
        return;
      }

      if (this.isScriptInjectionAttempted) {
        this.publishInstances([]);
        return;
      }

      this.injectScript();
    });

  constructor() {}

  public initialize(): void {
    window.addEventListener('load', () => {
      if (this.isInjectedScriptInitialized) {
        window.postMessage(new UpdateRequiredMessage(), '*');
        return;
      }

      this.publishInstances([]);
    });

    chrome.runtime.onMessage.addListener((data: unknown) => this.handleRuntimeMessage(data));

    window.addEventListener('message', ({ data }: MessageEvent) => {
      if (!MessageBase.isMessageData(data)) {
        return;
      }
      this.cumulativeHandler.handle(data);
    });

    this.injectScript();
  }

  private publishInstances(instances: MountedInstance[]): void {
    const currentInstancesState = instances.length !== 0 ? 'mounted' : 'not-mounted';

    if (this.latestInstancesState === currentInstancesState) {
      return;
    }

    this.latestInstancesState = currentInstancesState;
    chrome.runtime.sendMessage(new MountedInstancesMessage(instances));
  }

  private handleRuntimeMessage(data: unknown): undefined {
    if (!MessageBase.isMessageData(data)) {
      return;
    }

    if (this.isInjectedScriptInitialized) {
      window.postMessage(data, '*');
    }

    if (!this.isInjectedScriptInitialized && !this.isScriptInjectionAttempted) {
      this.injectScript();
    }

    if (UpdateRequiredMessage.isMessageData(data)) {
      this.publishInstances([]);
    }
  }

  private injectScript(): void {
    if (this.isScriptInjectionAttempted || this.isInjectedScriptInitialized) {
      return;
    }

    this.isScriptInjectionAttempted = true;

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injectable-content-script.js');

    script.onload = () => {
      this.isInjectedScriptInitialized = true;
      window.postMessage(new UpdateRequiredMessage(), '*');
    };

    script.onerror = (event: unknown) => {
      console.error('Failed to load injectable script:', event);
      this.publishInstances([]);
    };

    (document.head ?? document.documentElement).appendChild(script);
  }
}

new InjectedContent().initialize();
