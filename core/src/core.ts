import { Acessor } from "./accessor";
import { InteractiveObject } from "./declarations/interactive-object.type";
import { InteractiveObjectBuilder } from "./interactive-object-builder";

export class Core<K extends string> {
  readonly #interactor: InteractiveObjectBuilder =
    new InteractiveObjectBuilder();

  readonly #accessor: Acessor<InteractiveObject, K> = new Acessor<
    InteractiveObject,
    K
  >(window);

  public mount(key: K): void {
    this.#accessor.mount(key, this.#interactor.payload);
  }

  public unmount(key: K): void {
    this.#accessor.unmount(key);
  }
}
