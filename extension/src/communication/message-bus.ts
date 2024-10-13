import { Message } from './message';
import { MessageData } from './message-data';

type SubscriptionCallback<T = unknown> = (payload: T) => void;
type MessageEventListener = (event: MessageEvent) => void;

export class MessageBus {
  #channel: BroadcastChannel = new BroadcastChannel('__consy-message-bus');

  #eventListenerBySubscriptionCallback: Map<SubscriptionCallback<MessageData>, MessageEventListener> = new Map<
    SubscriptionCallback<MessageData>,
    MessageEventListener
  >();

  public publish(message: MessageData): void {
    console.log('Publishing message', message);

    this.#channel.postMessage(message);
  }

  public subscribe(callback: SubscriptionCallback<MessageData>): void {
    if (this.#eventListenerBySubscriptionCallback.has(callback)) {
      return;
    }

    const messageEventListener: MessageEventListener = (event: MessageEvent) => {
      const payload: unknown = event.data;
      if (!Message.isAbstractMessageData(payload)) {
        throw new Error(`Received event doesn't contain a compatible message data object`);
      }
      callback(payload);
    };
    this.#channel.addEventListener('message', messageEventListener);
    this.#eventListenerBySubscriptionCallback.set(callback, messageEventListener);
  }

  public unsubscribe(callback: SubscriptionCallback<MessageData>): void {
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
      (_listener: MessageEventListener, callback: SubscriptionCallback<MessageData>) => {
        this.unsubscribe(callback);
      }
    );

    this.#channel.close();
  }
}
