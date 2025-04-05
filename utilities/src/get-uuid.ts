import { Uuid } from '@consy/declarations';
import { v4 as getUuidV4 } from 'uuid';
import { isUuid } from './is-uuid';

export function getUuid(): Uuid {
  const uuidString: string = getUuidV4();

  if (!isUuid(uuidString)) {
    throw new Error(`Unexpected invalid UUID: ${uuidString}`);
  }

  return uuidString;
}
