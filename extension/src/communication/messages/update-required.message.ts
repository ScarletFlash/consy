import { MessageBase } from '../message-base';
import { MessageData } from '../message-data.type';

export class UpdateRequiredMessage extends MessageBase<{}> {
  public static readonly type: 'update-required' = 'update-required';
  public readonly type: typeof UpdateRequiredMessage.type = UpdateRequiredMessage.type;

  constructor() {
    super({});
  }

  public static override isMessageData(data: unknown): data is MessageData<typeof UpdateRequiredMessage> {
    return MessageBase.isMessageDataFromSource(UpdateRequiredMessage, data);
  }
}
