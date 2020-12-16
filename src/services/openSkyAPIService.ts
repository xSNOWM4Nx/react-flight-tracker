import { IService, Service, ServiceStateEnumeration, ServiceKeys, IRESTService, IResponse, createResponse, ResponseStateEnumeration } from '@daniel.neuweiler/ts-lib-module';
import {
  IStateVectorData, IStateVectorRawData, IStateVector,
  IAircraftFlight, IAircraftTrack,
  IMapGeoBounds
} from './../opensky/types';
import { URL, Constants } from './../opensky/constants';

const defaultStateInterval: number = 12000;
const registeredSatetInterval: number = 6000;
const metadataInterval: number = 5000;

export type StateVectorsUpdatedCallbackMethod = (stateVectors: IStateVectorData) => void;
interface IStateVectorsUpdatedSubscriberDictionary { [key: string]: StateVectorsUpdatedCallbackMethod };

export type AircraftTrackUpdatedCallbackMethod = (track: IAircraftTrack) => void;
interface IAircraftTrackUpdatedSubscriberDictionary { [key: string]: AircraftTrackUpdatedCallbackMethod };

export interface IOpenSkyAPIService extends IService {
  geoBounds: IMapGeoBounds;
  onStateVectorsUpdated: (contextKey: string, callbackHandler: StateVectorsUpdatedCallbackMethod) => string;
  offStateVectorsUpdated: (registerKey: string) => boolean;
  trackAircraft: (icao24: string) => void;
  releaseTrack: (icao24: string) => void;
  onAircraftTrackUpdated: (contextKey: string, callbackHandler: AircraftTrackUpdatedCallbackMethod) => string;
  offAircraftTrackUpdated: (registerKey: string) => boolean;
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
  private stateVectorsUpdatedSubscriberDictionary: IStateVectorsUpdatedSubscriberDictionary = {};
  private stateVectorsUpdatedSubscriptionCounter: number = 0;

  private fetchAircraftStateIntervalID: number = 0;
  private isFetchingAircraftStateVector: boolean = false;

  private fetchAircraftRouteIntervalID: number = 0;
  private isFetchingAircraftRoute: boolean = false;

  private fetchAircraftDataIntervalID: number = 0;
  private isFetchingAircraftData: boolean = false;

  private aircraftTrackUpdatedSubscriberDictionary: IAircraftTrackUpdatedSubscriberDictionary = {};
  private aircraftTrackUpdatedSubscriptionCounter: number = 0;
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
      icao24: '',
      callsign: ''
    };
  };

  public onStateVectorsUpdated = (contextKey: string, callbackHandler: StateVectorsUpdatedCallbackMethod) => {

    // Setup register key
    this.stateVectorsUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.stateVectorsUpdatedSubscriptionCounter}`

    // Register callback
    this.stateVectorsUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    this.logger.debug(`Component with key '${registerKey}' has subscribed on 'StateVectorsUpdated'.`);
    this.logger.debug(`'${Object.entries(this.stateVectorsUpdatedSubscriberDictionary).length}' subscribers on 'StateVectorsUpdated'.`);

    return registerKey;
  };

  public offStateVectorsUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.stateVectorsUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.stateVectorsUpdatedSubscriberDictionary[registerKey];
      this.logger.debug(`Component with key '${registerKey}' has unsubscribed on 'StateVectorsUpdated'.`);
      this.logger.debug(`'${Object.entries(this.stateVectorsUpdatedSubscriberDictionary).length}' subscribers on 'StateVectorsUpdated'.`);

      return true;
    }
    else {

      this.logger.error(`Component with key '${registerKey}' not registered on 'StateVectorsUpdated'.`);
      this.logger.debug(`'${Object.entries(this.stateVectorsUpdatedSubscriberDictionary).length}' subscribers on 'StateVectorsUpdated'.`);

      return false;
    };
  };

  public trackAircraft = (icao24: string) => {

    if (this.trackedAircraft.icao24 !== '') {

      this.logger.info(`Stop tracking for aircraft '${this.trackedAircraft.icao24}'.`);
    }

    clearInterval(this.fetchAircraftStateIntervalID);
    clearInterval(this.fetchAircraftRouteIntervalID);
    clearInterval(this.fetchAircraftDataIntervalID);

    this.trackedAircraft.icao24 = icao24;
    this.trackedAircraft.callsign = '';
    this.logger.info(`Start tracking for aircraft '${icao24}'.`);

    this.fetchAircraftState();
    // this.fetchAircraftRoute();
    // this.fetchAircraftData();

    const fetchStateVectorInterval: number = this.hasCredentials ? registeredSatetInterval : defaultStateInterval;
    this.fetchAircraftStateIntervalID = window.setInterval(this.fetchAircraftState, fetchStateVectorInterval);
  };

  public releaseTrack = (icao24: string) => {

    clearInterval(this.fetchAircraftStateIntervalID);
    clearInterval(this.fetchAircraftRouteIntervalID);
    clearInterval(this.fetchAircraftDataIntervalID);

    this.trackedAircraft.icao24 = '';
    this.trackedAircraft.callsign = '';
    this.logger.info(`Stop tracking for aircraft '${icao24}'.`);
  };

  public onAircraftTrackUpdated = (contextKey: string, callbackHandler: AircraftTrackUpdatedCallbackMethod) => {

    // Setup register key
    this.aircraftTrackUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.aircraftTrackUpdatedSubscriptionCounter}`

    // Register callback
    this.aircraftTrackUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    this.logger.debug(`Component with key '${registerKey}' has subscribed on 'AircraftTrackUpdated'.`);
    this.logger.debug(`'${Object.entries(this.aircraftTrackUpdatedSubscriberDictionary).length}' subscribers on 'AircraftTrackUpdated'.`);

    return registerKey;
  };

  public offAircraftTrackUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.aircraftTrackUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.aircraftTrackUpdatedSubscriberDictionary[registerKey];
      this.logger.debug(`Component with key '${registerKey}' has unsubscribed on 'StateVectorsUpdated'.`);
      this.logger.debug(`'${Object.entries(this.aircraftTrackUpdatedSubscriberDictionary).length}' subscribers on 'StateVectorsUpdated'.`);

      return true;
    }
    else {

      this.logger.error(`Component with key '${registerKey}' not registered on 'StateVectorsUpdated'.`);
      this.logger.debug(`'${Object.entries(this.aircraftTrackUpdatedSubscriberDictionary).length}' subscribers on 'StateVectorsUpdated'.`);

      return false;
    };
  };

  protected async onStarting(): Promise<IResponse<boolean>> {

    // Setup response
    const response = createResponse<boolean>(true, ResponseStateEnumeration.OK, []);

    // Check if the service provider was injected
    if (!this.serviceProvider) {

      this.updateState(ServiceStateEnumeration.Error);

      response.payload = false;
      response.messageStack = [
        {
          display: {
            key: "",
            value: `No service provider is injected. Service ${this.key} cannnot be started.`
          },
          context: ''
        }
      ]
      return response;
    };

    // Get the REST service
    this.restService = this.serviceProvider.getService<IRESTService>(ServiceKeys.RESTService);
    if (!this.restService) {

      this.updateState(ServiceStateEnumeration.Error);
      response.payload = false;
      response.messageStack = [
        {
          display: {
            key: "",
            value: `No REST service is available. Service ${this.key} cannnot be started.`
          },
          context: ''
        }
      ]
      return response;
    };

    // Check for authorization
    if (this.userName && this.password) {

      this.hasCredentials = true;
      this.restService.setAuthorization(`Basic ${btoa(`${this.userName}:${this.password}`)}`);

      this.userName = undefined;
      this.password = undefined;
    };

    const fetchStateVectorInterval: number = this.hasCredentials ? registeredSatetInterval : defaultStateInterval;
    this.fetchStateVectorsIntervalID = window.setInterval(this.fetchStateVectors, fetchStateVectorInterval);

    return response;
  };

  protected async onStopping(): Promise<IResponse<boolean>> {

    clearInterval(this.fetchStateVectorsIntervalID);
    clearInterval(this.fetchAircraftStateIntervalID);
    clearInterval(this.fetchAircraftRouteIntervalID);
    clearInterval(this.fetchAircraftDataIntervalID);

    return createResponse<boolean>(true, ResponseStateEnumeration.OK, []);
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
          Object.entries(this.stateVectorsUpdatedSubscriberDictionary).forEach(([key, value], index) => value(mappedData))
        }

        this.isFetchingStateVectors = false;
      })
      .finally(() => {

        this.isFetchingStateVectors = false;
      })
  };

  private fetchAircraftState = () => {

    if (!this.restService)
      return;

    if (this.trackedAircraft.icao24 === '')
      return;

    if (this.isFetchingAircraftStateVector)
      return;

    this.isFetchingAircraftStateVector = true;

    var targetURL = `${URL}/states/all?&icao24=${this.trackedAircraft.icao24}`;

    this.restService.get<IStateVectorRawData>(targetURL, {
      mode: 'cors',
      credentials: this.hasCredentials ? 'include' : 'omit'
    })
      .then(response => {

        if (response.payload) {

          var mappedData = this.mapRawStateVectorData(response.payload);

          if (mappedData.states.length > 0) {

            this.trackedAircraft.stateVector = mappedData.states[0]
            this.trackedAircraft.callsign = this.trackedAircraft.stateVector.callsign ? this.trackedAircraft.stateVector.callsign : '';

            Object.entries(this.aircraftTrackUpdatedSubscriberDictionary).forEach(([key, value], index) => value(this.trackedAircraft))
          }
        }

        this.isFetchingAircraftStateVector = false;
      })
      .finally(() => {

        this.isFetchingAircraftStateVector = false;
      })
  };

  private fetchAircraftRoute = () => {

    if (!this.restService)
      return;

    if (this.trackedAircraft.callsign === '')
      return;

    if (this.isFetchingAircraftRoute)
      return;

    this.isFetchingAircraftRoute = true;

    var targetURL = `${URL}/routes?callsign=${this.trackedAircraft.callsign}`;

    this.restService.get<any>(targetURL, {
      mode: 'no-cors',
      credentials: this.hasCredentials ? 'include' : 'omit'
    })
      .then(response => {

        if (response.payload) {

          //Todo
        }

        this.isFetchingAircraftRoute = false;
      })
      .finally(() => {

        this.isFetchingAircraftRoute = false;
      })
  };

  private fetchAircraftData = () => {

    if (!this.restService)
      return;

    if (this.trackedAircraft.icao24 === '')
      return;

    if (this.isFetchingAircraftData)
      return;

    this.isFetchingAircraftData = true;

    var targetURL = `${URL}/metadata/aircraft/icao/${this.trackedAircraft.icao24}`;

    this.restService.get<any>(targetURL, {
      mode: 'no-cors',
      credentials: 'include'
    })
      .then(response => {

        if (response.payload) {

          //Todo
        }

        this.isFetchingAircraftData = false;
      })
      .finally(() => {

        this.isFetchingAircraftData = false;
      })
  };
};