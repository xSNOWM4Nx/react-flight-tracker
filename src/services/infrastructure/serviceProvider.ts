// Types
import type { IService, IServiceProvider } from './serviceTypes.js';

export class ServiceProvider implements IServiceProvider {

  // IServiceProvider
  public serviceMap: Map<string, IService> = new Map<string, IService>();

  constructor() {
  };

  public addService = <T extends IService>(service: T, serviceKey: string) => {

    // Check if the service already exists
    if (this.serviceMap.has(serviceKey)) {
      console.error(`Service '${serviceKey}' already exists.`);
      return;
    }

    // Push the new service to the dictionary
    this.serviceMap.set(serviceKey, service);
    console.info(`Service '${serviceKey}' added.`);
  };

  public getService = <T extends IService>(serviceKey: string): T | undefined => {

    // Check if the service exists in the dictionary
    if (!this.serviceMap.has(serviceKey)) {
      console.error(`Service '${serviceKey}' not found.`);
      return undefined;
    }

    return this.serviceMap.get(serviceKey) as T;
  };

  public startServices = async () => {

    console.info(`'${this.serviceMap.size}' services detected.`);
    console.info(`Starting services.`);

    // Invoke the start method of each service
    const startResults: boolean[] = [];
    this.serviceMap.forEach(async (service, key) => {
      startResults.push(await service.start(this));
    });

    if (startResults.some(result => !result)) {
      console.error(`Not all services could be started. '${startResults.filter(result => !result).length}' services failed!`);
    } else {
      console.info(`All services started and ready.`);
    }

    return startResults.length === 0;
  };

  public stopServices = async () => {

    console.info(`'${this.serviceMap.size}' services detected.`);
    console.info(`Stopping services.`);

    const stopResults: boolean[] = [];
    this.serviceMap.forEach(async (service, key) => {
      stopResults.push(await service.stop());
    });

    if (stopResults.some(result => !result)) {
      console.error(`Not all services could be stopped. '${stopResults.filter(result => !result).length}' services failed!`);
    } else {
      console.info(`All services stopped.`);
    }

    return stopResults.length === 0;
  };
}
