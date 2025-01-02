import { Acessor, CallableCommand, CommandDefinition, InteractiveObject } from '@consy/declarations';
import { getValidatedParameterizableCommandParams, isParameterizableCommand } from '@consy/utilities';

export class InteractiveObjectBuilder {
  public static addCommand<T extends InteractiveObject, C extends CommandDefinition>(
    target: T,
    commandDefinition: C
  ): asserts target is T & Record<C['name'], C['callback']> {
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

    new Acessor<CallableCommand>(target).mount(commandDefinition.name, collableCommand);
  }

  public static removeCommand<T extends InteractiveObject, N extends string>(
    target: T,
    name: N
  ): asserts target is T & Record<N, never> {
    new Acessor<CallableCommand>(target).unmount(name);
  }
}
