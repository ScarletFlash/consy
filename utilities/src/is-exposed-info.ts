import { ExposedInfo } from '@consy/declarations';
import { isEmptyObject } from './is-empty-object';
import { isInstanceExposedInfo } from './is-instance-exposed-info';

export function isExposedInfo(input: unknown): input is ExposedInfo {
  if (typeof input !== 'object' || input === null) {
    return false;
  }

  const rawExposedInfo: Record<string, unknown> | {} = input;
  if (isEmptyObject(rawExposedInfo)) {
    return true;
  }

  return Object.values(rawExposedInfo).every((instanceExposedInfo: unknown) =>
    isInstanceExposedInfo(instanceExposedInfo)
  );
}
