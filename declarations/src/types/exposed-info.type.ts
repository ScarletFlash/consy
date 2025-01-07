import { InstanceExposedInfo } from './instance-exposed-info.type';

export interface ExposedInfo {
  [instanceKey: string]: InstanceExposedInfo;
}
