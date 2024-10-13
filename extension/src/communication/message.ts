import { MessageData } from './message-data';

export abstract class Message<P extends {}> implements MessageData<P> {
  abstract readonly type: Lowercase<string>;

  constructor(public readonly payload: P) {}

  public static isAbstractMessageData(message: unknown): message is MessageData {
    return typeof message === 'object' && message !== null && 'type' in message;
  }
}
