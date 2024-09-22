import { CommandDefinition, InteractiveObject } from "@consy/declarations";
import { Acessor } from "./accessor";
import { InteractiveObjectBuilder } from "./interactive-object-builder";

export class Core<K extends string> {
  readonly #interactor: InteractiveObjectBuilder =
    new InteractiveObjectBuilder();

  readonly #accessor: Acessor<InteractiveObject, K> = new Acessor<
    InteractiveObject,
    K
  >(window);

  readonly #key: K;

  constructor(key: K) {
    this.#key = key;
  }

  public mount(): void {
    this.#accessor.mount(this.#key, this.#interactor.payload);
  }

  public unmount(): void {
    this.#accessor.unmount(this.#key);
  }

  public addCommand(command: CommandDefinition): void {
    this.#interactor.addCommand(command);
  }

  public removeCommand(name: string): void {
    this.#interactor.removeCommand(name);
  }
}
