import { NULL_UUID, Uuid } from '@consy/declarations';
import { getUuid, isUuid } from '@consy/utilities';
import { Message } from './message';
import { MessageBase } from './message-base';
import { MessageProviderListenerCallback } from './message-provider-listener-callback.type';
import { MessagingProviderBase } from './messaging-provider-base';

type MessagingProviderConstructor = new () => MessagingProviderBase;

type SubscriptionCallback = (payload: Message) => void;

const MESSAGE_SOURCE_MARK: 'consy' = 'consy';
type SerializedMessagePrefix = `${typeof MESSAGE_SOURCE_MARK}/${Uuid}/`;
const SERIALIZED_MESSAGE_PREFIX_LENGTH: number = (
  `${MESSAGE_SOURCE_MARK}/${NULL_UUID}/` satisfies SerializedMessagePrefix
).length;
type SerializedMessage = `${SerializedMessagePrefix}${string}`;

export class MessageBus {
  readonly #instanceId: Uuid = getUuid();
  readonly #serializedMessagePrefix: SerializedMessagePrefix = `${MESSAGE_SOURCE_MARK}/${this.#instanceId}/`;

  #eventListenerBySubscriptionCallback: Set<SubscriptionCallback> = new Set<SubscriptionCallback>();
  readonly #provider: MessagingProviderBase;

  readonly #messageProviderListenerCallback: MessageProviderListenerCallback = (rawData: unknown) => {
    if (!MessageBus.#isSerializedMessage(rawData) || this.#isSerializedMessageFromThisInstance(rawData)) {
      return;
    }

    const deserializedMessage: Message = this.#getDeserialized(rawData);

    this.#eventListenerBySubscriptionCallback.forEach((subscriptionCallback: SubscriptionCallback) =>
      subscriptionCallback(deserializedMessage)
    );
  };

  constructor(providerConstructor: MessagingProviderConstructor) {
    this.#provider = new providerConstructor();
    this.#provider.listen(this.#messageProviderListenerCallback);
  }

  public publish(message: Message): void {
    const serializedMessage: SerializedMessage = this.#getSerialized(message);
    this.#provider.dispatch(serializedMessage);
  }

  public subscribe(callback: SubscriptionCallback): void {
    if (this.#eventListenerBySubscriptionCallback.has(callback)) {
      return;
    }

    this.#eventListenerBySubscriptionCallback.add(callback);
  }

  public unsubscribe(callback: SubscriptionCallback): void {
    this.#eventListenerBySubscriptionCallback.delete(callback);
  }

  static #isSerializedMessagePrefix(prefix: string): prefix is SerializedMessagePrefix {
    if (prefix.length !== SERIALIZED_MESSAGE_PREFIX_LENGTH) {
      return false;
    }
    const [sourceMark, instanceId]: string[] = prefix.split('/');
    return sourceMark === MESSAGE_SOURCE_MARK && isUuid(instanceId);
  }

  static #isSerializedMessage(message: unknown): message is SerializedMessage {
    if (typeof message !== 'string') {
      return false;
    }

    const messagePrefix: string = message.substring(0, SERIALIZED_MESSAGE_PREFIX_LENGTH);
    return MessageBus.#isSerializedMessagePrefix(messagePrefix) && message.length > SERIALIZED_MESSAGE_PREFIX_LENGTH;
  }

  #isSerializedMessageFromThisInstance(message: SerializedMessage): boolean {
    return message.startsWith(this.#serializedMessagePrefix);
  }

  #getDeserialized(serializedMessage: SerializedMessage): Message {
    const messageData: unknown = JSON.parse(serializedMessage.slice(this.#serializedMessagePrefix.length));
    if (!MessageBase.isMessageData(messageData)) {
      throw new Error('Invalid message data');
    }
    return messageData;
  }

  #getSerialized(message: Message): SerializedMessage {
    return `${MESSAGE_SOURCE_MARK}/${this.#instanceId}/${JSON.stringify(message)}`;
  }
}
