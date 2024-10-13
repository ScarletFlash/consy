export interface MessageData<P extends {} = {}> {
  readonly type: Lowercase<string>;
  readonly payload: P;
}
