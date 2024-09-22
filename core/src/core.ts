import { Acessor } from './accessor';
import { InteractiveObjectBuilder } from './interactive-object-builder';
import { InteractiveObject } from '@consy/declarations';

export class Core<K extends string> {
  readonly #interactor: InteractiveObjectBuilder = new InteractiveObjectBuilder();

  readonly #accessor: Acessor<InteractiveObject, K> = new Acessor<InteractiveObject, K>(window);

  public mount(key: K): void {
    this.#accessor.mount(key, this.#interactor.payload);
  }

  public unmount(key: K): void {
    this.#accessor.unmount(key);
  }
}
