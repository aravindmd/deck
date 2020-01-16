import { IPromise } from 'angular';
import { API } from '@spinnaker/core';

export interface IIpObjects {
  name: string;
  id: string;
}

export class IpObjectsReader {
  public static getIpObjects(): IPromise<IIpObjects[]> {
    return API.one('nobu/ipobjects')
      .getList()
      .catch(() => [] as IIpObjects[]);
  }
}
