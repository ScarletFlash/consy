import { MessageProviderListenerCallback } from './message-provider-listener-callback.type';

export abstract class MessagingProviderBase {
  public abstract dispatch(data: string): void;
  public abstract listen(callback: MessageProviderListenerCallback): void;
}
