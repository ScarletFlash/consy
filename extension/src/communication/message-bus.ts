import { MessageBase } from './message-base';
import { Message } from './message';

type SubscriptionCallback<T = unknown> = (payload: T) => void;
type MessageEventListener = (event: MessageEvent) => void;

export class MessageBus {
  #channel: BroadcastChannel = new BroadcastChannel('__consy-message-bus');

  #eventListenerBySubscriptionCallback: Map<SubscriptionCallback<Message>, MessageEventListener> = new Map<
    SubscriptionCallback<Message>,
    MessageEventListener
  >();

  public publish(message: Message): void {
    console.log('Publishing message', message);

    this.#channel.postMessage(message);
  }

  public subscribe(callback: SubscriptionCallback<Message>): void {
    if (this.#eventListenerBySubscriptionCallback.has(callback)) {
      return;
    }

    const messageEventListener: MessageEventListener = (event: MessageEvent) => {
      const messageData: unknown = event.data;
      if (MessageBase.isMessageData(messageData)) {
        callback(messageData);
        return;
      }
      throw new Error('Invalid message data');
    };
    this.#channel.addEventListener('message', messageEventListener);
    this.#eventListenerBySubscriptionCallback.set(callback, messageEventListener);
  }

  public unsubscribe(callback: SubscriptionCallback<Message>): void {
    const messageEventListener: MessageEventListener | undefined =
      this.#eventListenerBySubscriptionCallback.get(callback);
    if (messageEventListener === undefined) {
      return;
    }

    this.#channel.removeEventListener('message', messageEventListener);
    this.#eventListenerBySubscriptionCallback.delete(callback);
  }

  public close(): void {
    this.#eventListenerBySubscriptionCallback.forEach(
      (_listener: MessageEventListener, callback: SubscriptionCallback<Message>) => {
        this.unsubscribe(callback);
      }
    );

    this.#channel.close();
  }
}
