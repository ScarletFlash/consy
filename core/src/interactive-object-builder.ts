import { CallableCommand, CommandDefinition, InteractiveObject } from '@consy/declarations';
import { getValidatedParameterizableCommandParams, isParameterizableCommand } from '@consy/utilities';
import { Acessor } from './accessor';

export class InteractiveObjectBuilder {
  readonly #payload: InteractiveObject;
  readonly #accessor: Acessor<CallableCommand>;

  public get payload(): InteractiveObject {
    return this.#payload;
  }

  constructor() {
    this.#payload = Object.setPrototypeOf({}, null);
    this.#accessor = new Acessor<CallableCommand>(this.#payload);
  }

  public addCommand(commandDefinition: CommandDefinition): void {
    const collableCommand: CallableCommand = (...callParams: unknown[]) => {
      const commandResult: void | Promise<void> = commandDefinition.callback(
        isParameterizableCommand(commandDefinition)
          ? getValidatedParameterizableCommandParams({ commandDefinition, callParams })
          : {}
      );

      const onDoneMessage: string = `Command ${commandDefinition.name} is executed.`;
      commandResult instanceof Promise
        ? commandResult.finally(() => console.log(onDoneMessage))
        : console.log(onDoneMessage);
    };

    this.#accessor.mount(commandDefinition.name, collableCommand);
  }

  public removeCommand(name: string): void {
    this.#accessor.unmount(name);
  }
}
