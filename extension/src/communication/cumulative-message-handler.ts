import { Message } from './message';

export class CumulativeMessageHandler {
  readonly #handlerByType: Map<string, Function> = new Map<string, Function>();

  public provide<T extends Message>(type: T['type'], handler: (payload: T['payload']) => void): this {
    if (this.#handlerByType.has(type)) {
      throw new Error(
        `Handler for message type == ${type} is already provided. Combine handlers if needed or specify a different type`
      );
    }
    this.#handlerByType.set(type, handler);
    return this;
  }

  public handle({ type, payload }: Message): void {
    const handler: Function | undefined = this.#handlerByType.get(type);

    if (handler !== undefined) {
      handler(payload);
    }
  }
}
