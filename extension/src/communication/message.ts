export interface Message<P extends {} = {}> {
  readonly type: Lowercase<string>;
  readonly payload: P;
  /** @deprecated replace with a better alternative to ensure that all consumers and publishers are compatible with each other */
  readonly isConsyMessage: true;
}
