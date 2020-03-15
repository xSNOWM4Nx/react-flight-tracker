import { IService, Service, ServiceStateEnumeration, ServiceKeys, IRESTService, ResponseStateEnumeration } from '@daniel.neuweiler/ts-lib-module';
import {
  IStateVectorData, IStateVectorRawData, IStateVector,
  IAircraftFlight, IAircraftTrack,
  IMapGeoBounds
} from './../opensky/types';
import { URL, Constants } from './../opensky/constants';

export interface IOpenSkyAPIService extends IService {
  geoBounds: IMapGeoBounds;
  onStateVectorsUpdated: (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => void;
  offStateVectorsUpdated: (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => void;
  trackAircraft: (icao24: string) => void;
  releaseTrack: (icao24: string) => void;
  onAircraftTrackUpdated: (caller: string, callbackHandler: (track: IAircraftTrack) => void) => void;
  offAircraftTrackUpdated: (caller: string, callbackHandler: (track: IAircraftTrack) => void) => void;
};

export class OpenSkyAPIService extends Service implements IOpenSkyAPIService {

  // IOpenSkyAPIService
  public geoBounds: IMapGeoBounds;

  // Props
  private restService?: IRESTService;

  private userName?: string;
  private password?: string;
  private hasCredentials: boolean = false;

  private fetchStateVectorsIntervalID: number = 0;
  private isFetchingStateVectors: boolean = false;
  private onStateVectorUpdateSubscribers: Array<(stateVectors: IStateVectorData) => void> = [];

  private fetchTrackedStateVectorIntervalID: number = 0;
  private isFetchingTrackedStateVector: boolean = false;
  private onAircraftTrackUpdateSubscribers: Array<(track: IAircraftTrack) => void> = [];
  private trackedAircraft: IAircraftTrack;

  constructor(userName?: string, password?: string) {
    super('OpenSkyAPIService');

    this.userName = userName;
    this.password = password;

    this.geoBounds = {
      southernLatitude: Constants.DEFAULT_MIN_LATITUDE,
      northernLatitude: Constants.DEFAULT_MAX_LATITUDE,
      westernLongitude: Constants.DEFAULT_MIN_LONGITUDE,
      easternLongitude: Constants.DEFAULT_MAX_LONGITUDE
    };

    this.trackedAircraft = {
      icao24: ''
    };
  };

  public async start() {

    // Check if the service provider was injected
    if (!this.serviceProvider) {

      this.updateState(ServiceStateEnumeration.Error);
      return this.resolveNotStartingResponse('No service provider is injected. As a result, some services are not available.');
    }

    // Get the REST service
    this.restService = this.serviceProvider.getService<IRESTService>(ServiceKeys.RESTService);
    if (!this.restService) {

      this.updateState(ServiceStateEnumeration.Error);
      return this.resolveNotStartingResponse('No REST service available.');
    }

    // Check for authorization
    if (this.userName && this.password) {

      this.hasCredentials = true;
      this.restService.setAuthorization(`Basic ${btoa(`${this.userName}:${this.password}`)}`);

      this.userName = undefined;
      this.password = undefined;
    }

    var superResponse = await super.start();
    if (superResponse.state !== ResponseStateEnumeration.OK)
      return superResponse;

    const fetchStateVectorInterval: number = this.hasCredentials ? 6000 : 12000;
    this.fetchStateVectorsIntervalID = window.setInterval(this.fetchStateVectors, fetchStateVectorInterval);

    return superResponse;
  };

  public async stop() {

    clearInterval(this.fetchStateVectorsIntervalID);
    clearInterval(this.fetchTrackedStateVectorIntervalID);

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

  public trackAircraft = (icao24: string) => {

    if (this.trackedAircraft.icao24 !== '') {

      this.logger.info(`Stop tracking for aircraft '${this.trackedAircraft.icao24}'.`);
    }

    clearInterval(this.fetchTrackedStateVectorIntervalID);

    this.trackedAircraft.icao24 = icao24;
    this.logger.info(`Start tracking for aircraft '${icao24}'.`);

    this.fetchStateVector();

    const fetchStateVectorInterval: number = this.hasCredentials ? 6000 : 12000;
    this.fetchTrackedStateVectorIntervalID = window.setInterval(this.fetchStateVector, fetchStateVectorInterval);
  };

  public releaseTrack = (icao24: string) => {

    clearInterval(this.fetchTrackedStateVectorIntervalID);

    this.trackedAircraft.icao24 = '';
    this.logger.info(`Stop tracking for aircraft '${icao24}'.`);
  };

  public onAircraftTrackUpdated = (caller: string, callbackHandler: (track: IAircraftTrack) => void) => {

    var index = this.onAircraftTrackUpdateSubscribers.indexOf(callbackHandler);
    if (index < 0)
      this.onAircraftTrackUpdateSubscribers.push(callbackHandler);

    this.logger.debug(`'${caller}' has subscribed for 'AircraftTrackUpdated'.`);
    this.logger.debug(`'${this.onStateVectorUpdateSubscribers.length}' subscribers for 'AircraftTrackUpdated'.`);
  };

  public offAircraftTrackUpdated = (caller: string, callbackHandler: (track: IAircraftTrack) => void) => {

    var index = this.onAircraftTrackUpdateSubscribers.indexOf(callbackHandler);
    if (index >= 0)
      this.onAircraftTrackUpdateSubscribers.splice(index, 1);

    this.logger.debug(`'${caller}' has unsubscribed for 'AircraftTrackUpdated'.`);
    this.logger.debug(`'${this.onStateVectorUpdateSubscribers.length}' subscribers for 'AircraftTrackUpdated'.`);
  };

  private mapRawStateVectorData = (rawData: IStateVectorRawData) => {

    const data: IStateVectorData = {
      time: rawData.time,
      states: []
    };

    if (!rawData.states)
      return data;

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

    if (!this.restService)
      return;

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

        if (response.payload) {

          var mappedData = this.mapRawStateVectorData(response.payload);
          this.onStateVectorUpdateSubscribers.forEach(callback => callback(mappedData))
        }

        this.isFetchingStateVectors = false;
      })
      .finally(() => {

        this.isFetchingStateVectors = false;
      })
  };

  private fetchStateVector = () => {

    if (!this.restService)
      return;

    if (this.trackedAircraft.icao24 === '')
      return;

    if (this.isFetchingTrackedStateVector)
      return;

    this.isFetchingTrackedStateVector = true;

    var targetURL = `${URL}/states/all?icao24=${this.trackedAircraft.icao24}`;

    this.restService.get<IStateVectorRawData>(targetURL, {
      mode: 'cors',
      credentials: this.hasCredentials ? 'include' : 'omit'
    })
      .then(response => {

        if (response.payload) {

          var mappedData = this.mapRawStateVectorData(response.payload);

          if (mappedData.states.length > 0) {

            this.trackedAircraft.stateVector = mappedData.states[0]
            this.onAircraftTrackUpdateSubscribers.forEach(callback => callback(this.trackedAircraft))
          }
        }

        this.isFetchingTrackedStateVector = false;
      })
      .finally(() => {

        this.isFetchingTrackedStateVector = false;
      })
  };
};