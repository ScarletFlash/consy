import { MessageProviderListenerCallback } from '../message-provider-listener-callback.type';
import { MessagingProviderBase } from '../messaging-provider-base';

export class ServiceWorkerMessagingProvider extends MessagingProviderBase {
  public dispatch(data: string): void {
    throw new Error('Method not implemented.');
  }
  public listen(callback: MessageProviderListenerCallback): void {
    throw new Error('Method not implemented.');
  }
}
