type AbstractConstructor = new (...params: any[]) => any;

export type MessageData<T extends AbstractConstructor> = Pick<InstanceType<T>, 'type' | 'payload' | 'isConsyMessage'>;
