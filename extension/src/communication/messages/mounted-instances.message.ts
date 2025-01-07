import { InstanceExposedInfo } from '@consy/declarations';
import { MessageBase } from '../message-base';
import { MessageData } from '../message-data.type';

export interface MountedInstance {
  key: string;
  commands: InstanceExposedInfo;
}

export class MountedInstancesMessage extends MessageBase<MountedInstance[]> {
  public static readonly type: 'mounted-instances' = 'mounted-instances';
  public readonly type: typeof MountedInstancesMessage.type = MountedInstancesMessage.type;

  public static override isMessageData(data: unknown): data is MessageData<typeof MountedInstancesMessage> {
    return MessageBase.isMessageDataFromSource(MountedInstancesMessage, data);
  }
}
