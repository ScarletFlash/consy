import { NullUuid } from './null-uuid.type';

export type Uuid =
  | `${string}-${string}-${1 | 2 | 3 | 4 | 5}${string}-${8 | 9 | 'a' | 'b'}${string}-${string}`
  | NullUuid;
