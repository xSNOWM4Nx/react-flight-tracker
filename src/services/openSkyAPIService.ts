import { IService, Service, ServiceStateEnumeration, ServiceKeys, IRESTService, ResponseStateEnumeration } from '@daniel.neuweiler/ts-lib-module';
import {
  IStateVectorData, IStateVectorRawData, IStateVector,
  IAircraftFlight, IAircraftFullTrack,
  IMapGeoBounds
} from './../opensky/types';
import { URL, Constants } from './../opensky/constants';

export interface IOpenSkyAPIService extends IService {
  geoBounds: IMapGeoBounds;
  onStateVectorsUpdated: (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => void;
  offStateVectorsUpdated: (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => void;
};

export class OpenSkyAPIService extends Service implements IOpenSkyAPIService {

  // IOpenSkyAPIService
  public geoBounds: IMapGeoBounds;

  // Props
  private restService: IRESTService;
  private hasCredentials: boolean = false;
  private fetchStateVectorIntervalID: number = 0;
  private isFetchingStateVectors: boolean = false;
  private onStateVectorUpdateSubscribers: Array<(stateVectors: IStateVectorData) => void> = [];

  constructor(restService: IRESTService, userName?: string, password?: string) {
    super('OpenSkyAPIService');

    this.restService = restService;

    if (userName && password) {

      this.hasCredentials = true;
      this.restService.setAuthorization(`Basic ${btoa(`${userName}:${password}`)}`);
    }

    this.geoBounds = {
      southernLatitude: Constants.DEFAULT_MIN_LATITUDE,
      northernLatitude: Constants.DEFAULT_MAX_LATITUDE,
      westernLongitude: Constants.DEFAULT_MIN_LONGITUDE,
      easternLongitude: Constants.DEFAULT_MAX_LONGITUDE
    };

  };

  public async start() {

    if (!this.serviceProvider) {

      this.updateState(ServiceStateEnumeration.Error);
      return this.resolveNotStartingResponse('No service provider is injected. Some services that this service needs are not available.');
    }

    var superResponse = await super.start();
    if (superResponse.state !== ResponseStateEnumeration.OK)
      return superResponse;

    const fetchStateVectorInterval: number = this.hasCredentials ? 6000 : 12000;
    this.fetchStateVectorIntervalID = window.setInterval(this.fetchStateVectors, fetchStateVectorInterval);

    return superResponse;
  };

  public async stop() {

    clearInterval(this.fetchStateVectorIntervalID);

    var superResponse = await super.stop();
    return superResponse;
  };

  public onStateVectorsUpdated = (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => {

    var index = this.onStateVectorUpdateSubscribers.indexOf(callbackHandler);
    if (index < 0)
      this.onStateVectorUpdateSubscribers.push(callbackHandler);

    this.logger.debug(`'${caller}' has subscribed for 'StateVectorsUpdated'.`);
    this.logger.debug(`'${this.onStateVectorUpdateSubscribers.length}' subscribers for 'StateVectorsUpdated'.`);
  };

  public offStateVectorsUpdated = (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => {

    var index = this.onStateVectorUpdateSubscribers.indexOf(callbackHandler);
    if (index >= 0)
      this.onStateVectorUpdateSubscribers.splice(index, 1);

    this.logger.debug(`'${caller}' has unsubscribed for 'StateVectorsUpdated'.`);
    this.logger.debug(`'${this.onStateVectorUpdateSubscribers.length}' subscribers for 'StateVectorsUpdated'.`);
  };

  private mapRawStateVectorData = (rawData: IStateVectorRawData) => {

    const data: IStateVectorData = {
      time: rawData.time,
      states: []
    };

    for (var rawStateVector of rawData.states) {

      const stateVector: IStateVector = {
        icao24: rawStateVector[0],
        callsign: rawStateVector[1],
        origin_country: rawStateVector[2],
        time_position: rawStateVector[3],
        last_contact: rawStateVector[4],
        longitude: rawStateVector[5],
        latitude: rawStateVector[6],
        baro_altitude: rawStateVector[7],
        on_ground: rawStateVector[8],
        velocity: rawStateVector[9],
        true_track: rawStateVector[10],
        vertical_rate: rawStateVector[11],
        sensors: rawStateVector[12],
        geo_altitude: rawStateVector[13],
        squawk: rawStateVector[14],
        spi: rawStateVector[15],
        position_source: rawStateVector[16],
      }

      data.states.push(stateVector);
    }

    return data;
  };

  private fetchStateVectors = () => {

    if (this.isFetchingStateVectors)
      return;

    this.isFetchingStateVectors = true;

    var stateBounds = `?lamin=${this.geoBounds.southernLatitude}&lomin=${this.geoBounds.westernLongitude}&lamax=${this.geoBounds.northernLatitude}&lomax=${this.geoBounds.easternLongitude}`;
    var targetURL = `${URL}/states/all${stateBounds}`;

    this.restService.get<IStateVectorRawData>(targetURL, {
      mode: 'cors',
      credentials: this.hasCredentials ? 'include' : 'omit'
    })
      .then(response => {

        if (response.payload && (typeof response.payload === 'object')) {

          var mappedData = this.mapRawStateVectorData(response.payload);
          this.onStateVectorUpdateSubscribers.forEach(callback => callback(mappedData))
        }

        this.isFetchingStateVectors = false;
      })
      .finally(() => {

        this.isFetchingStateVectors = false;
      })
  };

};