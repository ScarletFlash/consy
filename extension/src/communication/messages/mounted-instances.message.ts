import { Message } from '../message';

interface MountedInstance {
  key: string;
}

export class MountedInstancesMessage extends Message<MountedInstance[]> {
  public static readonly type: 'mounted-instances' = 'mounted-instances';
  public readonly type: typeof MountedInstancesMessage.type = MountedInstancesMessage.type;

  public static isMessageData(
    message: unknown
  ): message is Pick<InstanceType<typeof MountedInstancesMessage>, 'type' | 'payload'> {
    return Message.isAbstractMessageData(message) && message.type === MountedInstancesMessage.type;
  }
}
