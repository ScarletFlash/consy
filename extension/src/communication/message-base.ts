import { Message } from './message';

export abstract class MessageBase<P extends {}> implements Message<P> {
  abstract readonly type: Lowercase<string>;
  public readonly isConsyMessage: true = true;

  constructor(public readonly payload: P) {}

  protected static isMessageDataFromSource<T extends Pick<Message, 'type'>>(
    typeSource: Pick<Message, 'type'>,
    messageData: unknown
  ): messageData is T {
    return MessageBase.isMessageData(messageData) && messageData.type === typeSource.type;
  }

  public static isMessageData(data: unknown): data is Message {
    return (
      typeof data === 'object' &&
      data !== null &&
      ('isConsyMessage' satisfies keyof Message) in data &&
      data.isConsyMessage === true &&
      ('type' satisfies keyof Message) in data &&
      typeof data.type === 'string'
    );
  }
}
