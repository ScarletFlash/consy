import {
  Acessor,
  CommandDefinition,
  CommandParamsDefinition,
  EXPOSED_INFO_PROPERTY_NAME,
  ExposedInfo,
  InstanceExposedInfo,
  InteractiveObject,
  NonParameterizableCommand,
  ParameterizableCommand
} from '@consy/declarations';
import { isParameterizableCommand } from '@consy/utilities';
import { InteractiveObjectBuilder } from './interactive-object-builder';

export class Consy<K extends string = string> {
  readonly #interactor: InteractiveObject = Object.setPrototypeOf({}, null);

  readonly #instanceExposedInfo: ExposedInfo = {};

  readonly #key: K;

  readonly #interactiveObjectAccessor: Acessor<InteractiveObject, K> = new Acessor<InteractiveObject, K>(window);
  readonly #exposedInfoAccessor: Acessor<ExposedInfo, typeof EXPOSED_INFO_PROPERTY_NAME> = new Acessor<
    ExposedInfo,
    typeof EXPOSED_INFO_PROPERTY_NAME
  >(window);

  readonly #instanceExposedInfoAccessor: Acessor<InstanceExposedInfo, string> = new Acessor<
    InstanceExposedInfo,
    string
  >(this.#instanceExposedInfo);

  constructor(key: K) {
    if (key.length === 0) {
      throw new Error('Key cannot be an empty string.');
    }

    this.#key = key;
  }

  public mount(): this {
    this.#interactiveObjectAccessor.mount(this.#key, this.#interactor);

    const isExposedInfoPropertyMounted: boolean = this.#exposedInfoAccessor.isMounted(EXPOSED_INFO_PROPERTY_NAME);
    if (!isExposedInfoPropertyMounted) {
      this.#exposedInfoAccessor.mount(EXPOSED_INFO_PROPERTY_NAME, {});
    }
    const exposedInfo: ExposedInfo = this.#exposedInfoAccessor.getValue(EXPOSED_INFO_PROPERTY_NAME);
    new Acessor(exposedInfo).mount(this.#key, this.#instanceExposedInfo);

    return this;
  }

  public unmount(): this {
    this.#interactiveObjectAccessor.unmount(this.#key);

    const isExposedKeysPropertyMounted: boolean = this.#exposedInfoAccessor.isMounted(EXPOSED_INFO_PROPERTY_NAME);
    if (!isExposedKeysPropertyMounted) {
      throw new Error('The exposed keys property is not mounted, so it cannot be unmounted.');
    }
    const exposedInfo: ExposedInfo = this.#exposedInfoAccessor.getValue(EXPOSED_INFO_PROPERTY_NAME);
    new Acessor(exposedInfo).unmount(this.#key);

    return this;
  }

  public addCommand<D extends CommandParamsDefinition>(commandDefinition: ParameterizableCommand<D>): this;
  public addCommand(commandDefinition: NonParameterizableCommand): this;
  public addCommand(commandDefinition: CommandDefinition): this {
    InteractiveObjectBuilder.addCommand(this.#interactor, commandDefinition);
    this.#instanceExposedInfoAccessor.mount(
      commandDefinition.name,
      isParameterizableCommand(commandDefinition) ? commandDefinition.params : {}
    );

    return this;
  }

  public removeCommand(name: string): this {
    InteractiveObjectBuilder.removeCommand(this.#interactor, name);
    this.#instanceExposedInfoAccessor.unmount(name);

    return this;
  }
}
