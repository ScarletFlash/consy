import { InstanceExposedInfo } from '@consy/declarations';
import { isCommandParamsDefinition } from './is-command-params-definition';
import { isEmptyObject } from './is-empty-object';

export function isInstanceExposedInfo(input: unknown): input is InstanceExposedInfo {
  if (typeof input !== 'object' || input === null || isEmptyObject(input)) {
    return false;
  }

  return Object.values(input).every((rawParamsDefinition: unknown) => {
    if (typeof rawParamsDefinition !== 'object' || rawParamsDefinition === null) {
      return false;
    }

    return isCommandParamsDefinition(rawParamsDefinition);
  });
}
