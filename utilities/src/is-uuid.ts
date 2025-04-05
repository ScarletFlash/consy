import { Uuid } from '@consy/declarations';
import { validate as isValidUuid } from 'uuid';

export function isUuid(input: unknown): input is Uuid {
  return isValidUuid(input);
}
