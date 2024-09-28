import { CommandDefinition, InteractiveObject } from '@consy/declarations';
import { Acessor } from './accessor';
import { InteractiveObjectBuilder } from './interactive-object-builder';

export class Consy<K extends string = string> {
  readonly #interactor: InteractiveObjectBuilder = new InteractiveObjectBuilder();

  readonly #accessor: Acessor<InteractiveObject, K> = new Acessor<InteractiveObject, K>(window);

  readonly #key: K;

  constructor(key: K) {
    this.#key = key;
  }

  public mount(): this {
    this.#accessor.mount(this.#key, this.#interactor.payload);
    return this;
  }

  public unmount(): this {
    this.#accessor.unmount(this.#key);
    return this;
  }

  public addCommand(command: CommandDefinition): this {
    this.#interactor.addCommand(command);
    return this;
  }

  public removeCommand(name: string): this {
    this.#interactor.removeCommand(name);
    return this;
  }
}
