import { Message } from '../message';

export class NotMountedMessage extends Message<{}> {
  public static readonly type: 'not-mounted' = 'not-mounted';
  public readonly type: typeof NotMountedMessage.type = NotMountedMessage.type;

  constructor() {
    super({});
  }

  public static isMessageData(
    message: unknown
  ): message is Pick<InstanceType<typeof NotMountedMessage>, 'type' | 'payload'> {
    return Message.isAbstractMessageData(message) && message.type === NotMountedMessage.type;
  }
}
