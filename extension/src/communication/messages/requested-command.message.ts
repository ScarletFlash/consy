import { CommandParams, CommandParamsDefinition } from '@consy/declarations';
import { MessageBase } from '../message-base';
import { MessageData } from '../message-data.type';

export interface RequestedCommand<D extends CommandParamsDefinition = CommandParamsDefinition> {
  instanceKey: string;
  name: string;
  params: CommandParams<D>;
}

export class RequestedCommandMessage<D extends CommandParamsDefinition = CommandParamsDefinition> extends MessageBase<
  RequestedCommand<D>
> {
  public static readonly type: 'requested-command' = 'requested-command';
  public readonly type: typeof RequestedCommandMessage.type = RequestedCommandMessage.type;

  public static override isMessageData(data: unknown): data is MessageData<typeof RequestedCommandMessage> {
    return MessageBase.isMessageDataFromSource(RequestedCommandMessage, data);
  }
}
