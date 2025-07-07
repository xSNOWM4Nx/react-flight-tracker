
export enum ServiceStateEnumeration {
  Unknown,
  Initialized,
  Running,
  Stopped,
  Error
}

export interface IService {
  key: string;
  state: ServiceStateEnumeration;
  start: (serviceProvider?: IServiceProvider) => Promise<boolean>;
  stop: () => Promise<boolean>;
}

export interface IServiceProvider {
  addService: <T extends IService>(service: T, serviceKey: string) => void;
  getService: <T extends IService>(serviceKey: string) => T | undefined;
  startServices: () => Promise<boolean>;
  stopServices: () => Promise<boolean>;
}
