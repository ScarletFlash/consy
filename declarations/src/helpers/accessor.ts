type Host = Record<string, any>;
type Target<P, K extends string> = Record<K, P>;

export class Acessor<P, K extends string = string> {
  readonly #host: Host | (Host & Target<P, K>);

  constructor(host: Host) {
    this.#host = host;
  }

  public mount(key: K, payload: P): void {
    if (this.isMounted(key)) {
      throw new Error(`Key ${key} is already mounted. Either unmount it first or use a different key.`);
    }

    Object.defineProperty(this.#host, key, {
      value: payload,
      writable: false,
      enumerable: true,
      configurable: false
    });
  }

  public unmount(key: K): void {
    if (!this.isMounted(key)) {
      throw new Error(`Key ${key} is not mounted, so it cannot be unmounted.`);
    }
    delete this.#host[key];
  }

  public getValue(key: K): P {
    if (!this.isMounted(key)) {
      throw new Error(`Key ${key} is not mounted, so it cannot be accessed.`);
    }
    return this.#host[key];
  }

  public isMounted(key: K): boolean {
    return key in this.#host;
  }
}
