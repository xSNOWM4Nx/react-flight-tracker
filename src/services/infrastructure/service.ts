import { ServiceStateEnumeration } from './serviceTypes.js';

// Types
import type { IService, IServiceProvider } from './serviceTypes.js';

export abstract class Service implements IService {

  // IService
  public key: string;
  public state: ServiceStateEnumeration;

  protected serviceProvider?: IServiceProvider;
  private version: number = 0;

  constructor(key: string) {
    this.key = key;
    this.state = ServiceStateEnumeration.Unknown;
  };

  public async start(serviceProvider?: IServiceProvider) {

    this.serviceProvider = serviceProvider;

    console.info(`Service '${this.key}' is starting...`);

    var onStartingResponse = await this.onStarting();
    if (onStartingResponse) {
      this.state = ServiceStateEnumeration.Running;
      console.info(`Service '${this.key}' is running.`);
    } else {
      this.state = ServiceStateEnumeration.Error;
      console.error(`Service '${this.key}' could not be started.`);
      return false;
    }

    return true;
  };

  public async stop() {

    console.info(`Service '${this.key}' is stopping...`);

    var onStoppingResponse = await this.onStopping();
    if (onStoppingResponse) {
      this.state = ServiceStateEnumeration.Stopped;
      console.info(`Service '${this.key}' is stopped.`);
    } else {
      this.state = ServiceStateEnumeration.Error;
      console.error(`Service '${this.key}' could not be stopped.`);
      return false;
    }

    return true;
  };

  protected abstract onStopping(): Promise<boolean>;

  protected abstract onStarting(): Promise<boolean>;

  protected updateState = (state: ServiceStateEnumeration) => {

    this.state = state;
    this.updateVersion(`State changed to '${ServiceStateEnumeration[this.state]}'.`);
  };

  protected updateVersion = (reason: string) => {

    this.version++;
    console.debug(`Service '${this.key}' version has been updated to '${this.version}'. Reason: ${reason}`);

    // Execute callbacks
    //Object.entries(this.changesSubscriberDictionary).forEach(([key, value], index) => value(this.version, reason, this.key));
  };
}
