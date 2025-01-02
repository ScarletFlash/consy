import {
  Acessor,
  CommandDefinition,
  CommandParamsDefinition,
  EXPOSED_KEYS_PROPERTY_NAME,
  InteractiveObject,
  NonParameterizableCommand,
  ParameterizableCommand
} from '@consy/declarations';
import { InteractiveObjectBuilder } from './interactive-object-builder';

export class Consy<K extends string = string> {
  readonly #interactor: InteractiveObject = Object.setPrototypeOf({}, null);

  readonly #interactiveObjectAccessor: Acessor<InteractiveObject, K> = new Acessor<InteractiveObject, K>(window);
  readonly #exposedKeysAccessor: Acessor<string[], string> = new Acessor<string[], string>(window);

  readonly #key: K;

  constructor(key: K) {
    if (key.length === 0) {
      throw new Error('Key cannot be an empty string.');
    }

    this.#key = key;
  }

  public mount(): this {
    this.#interactiveObjectAccessor.mount(this.#key, this.#interactor);

    const isExposedKeysPropertyMounted: boolean = this.#exposedKeysAccessor.isMounted(EXPOSED_KEYS_PROPERTY_NAME);
    if (!isExposedKeysPropertyMounted) {
      this.#exposedKeysAccessor.mount(EXPOSED_KEYS_PROPERTY_NAME, []);
    }
    const rawExposedKeys: string[] = this.#exposedKeysAccessor.getValue(EXPOSED_KEYS_PROPERTY_NAME);
    if (rawExposedKeys.includes(this.#key)) {
      throw new Error(`The key "${this.#key}" is already used by a different instance of Consy.`);
    }
    rawExposedKeys.push(this.#key);

    return this;
  }

  public unmount(): this {
    this.#interactiveObjectAccessor.unmount(this.#key);

    const isExposedKeysPropertyMounted: boolean = this.#exposedKeysAccessor.isMounted(EXPOSED_KEYS_PROPERTY_NAME);
    if (!isExposedKeysPropertyMounted) {
      throw new Error('The exposed keys property is not mounted, so it cannot be unmounted.');
    }
    const rawExposedKeys: string[] = this.#exposedKeysAccessor.getValue(EXPOSED_KEYS_PROPERTY_NAME);

    const keyIndex: number = rawExposedKeys.indexOf(this.#key);
    if (keyIndex === -1) {
      throw new Error(`The key "${this.#key}" is not used by any instance of Consy.`);
    }
    rawExposedKeys.splice(keyIndex, 1);

    return this;
  }

  public addCommand<D extends CommandParamsDefinition>(command: ParameterizableCommand<D>): this;
  public addCommand(command: NonParameterizableCommand): this;
  public addCommand(command: CommandDefinition): this {
    InteractiveObjectBuilder.addCommand(this.#interactor, command);
    return this;
  }

  public removeCommand(name: string): this {
    InteractiveObjectBuilder.removeCommand(this.#interactor, name);
    return this;
  }
}
