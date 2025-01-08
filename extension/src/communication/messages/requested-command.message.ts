import { CommandDefinition, ParameterizableCommand } from '@consy/declarations';
import { MessageBase } from '../message-base';
import { MessageData } from '../message-data.type';

export interface RequestedCommand<D extends CommandDefinition = CommandDefinition> {
  instanceKey: string;
  name: D['name'];
  params: D extends ParameterizableCommand<infer P> ? P : {};
}

export class RequestedCommandMessage<D extends CommandDefinition = CommandDefinition> extends MessageBase<
  RequestedCommand<D>
> {
  public static readonly type: 'requested-command' = 'requested-command';
  public readonly type: typeof RequestedCommandMessage.type = RequestedCommandMessage.type;

  public static override isMessageData(data: unknown): data is MessageData<typeof RequestedCommandMessage> {
    return MessageBase.isMessageDataFromSource(RequestedCommandMessage, data);
  }
}
