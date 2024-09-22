import { CallableCommand, CommandDefinition, InteractiveObject } from '@consy/declarations';
import { Acessor } from './accessor';

export class InteractiveObjectBuilder {
  readonly #payload: InteractiveObject = {};
  readonly #accessor: Acessor<CallableCommand> = new Acessor<CallableCommand>(this.#payload);

  public get payload(): InteractiveObject {
    return this.#payload;
  }

  public addCommand(command: CommandDefinition): void {
    const collableCommand: CallableCommand = () => {
      const commandResult: void | Promise<void> = command.callback();

      const onDoneMessage: string = `Command ${command.name} is executed.`;
      commandResult instanceof Promise
        ? commandResult.finally(() => console.log(onDoneMessage))
        : console.log(onDoneMessage);
    };

    this.#accessor.mount(command.name, collableCommand);
  }

  public removeCommand(name: string): void {
    this.#accessor.unmount(name);
  }
}
