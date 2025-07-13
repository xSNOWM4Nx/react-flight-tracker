import { Service } from './infrastructure/service.js';
import { URL, Constants } from './../opensky/constants.js';
import { ServiceStateEnumeration } from './infrastructure/serviceTypes.js';
import { ServiceKeys } from './serviceKeys.js';
import { StateVectorChangeTypeEnumeration } from './../opensky/types.js';

// Types
import type { IService } from './infrastructure/serviceTypes.js';
import type { IRESTService } from './restService.js';
import type { IStateVectorData, IStateVectorRawData, IStateVectorChangeType, IStateVector, IAircraftFlight, IAircraftTrack, IMapGeoBounds } from './../opensky/types.js';

const defaultStateInterval: number = 10000;
const registeredSatetInterval: number = 5000;
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

  private clientId?: string;
  private clientSecret?: string;
  private accessToken: string | null = null;
  private expiresAt: number = 0; // Unix Timestamp in ms
  private hasCredentials: boolean = false;
  private getRequestInit: RequestInit = {};
  private lastPositions = new Map<string, IStateVectorChangeType>();

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

  constructor(key: string, clientId?: string, clientSecret?: string) {
    super(key);

    this.clientId = clientId;
    this.clientSecret = clientSecret;

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
    console.debug(`Component with key '${registerKey}' has subscribed on 'StateVectorsUpdated'.`);
    return registerKey;
  };

  public offStateVectorsUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.stateVectorsUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.stateVectorsUpdatedSubscriberDictionary[registerKey];
      console.debug(`Component with key '${registerKey}' has unsubscribed on 'StateVectorsUpdated'.`);
      return true;
    }
    else {

      console.error(`Component with key '${registerKey}' not registered on 'StateVectorsUpdated'.`);
      return false;
    };
  };

  public trackAircraft = (icao24: string) => {

    if (this.trackedAircraft.icao24 !== '') {
      console.info(`Release tracking for aircraft '${this.trackedAircraft.icao24}'.`);
    }

    clearInterval(this.fetchAircraftStateIntervalID);
    clearInterval(this.fetchAircraftRouteIntervalID);
    clearInterval(this.fetchAircraftDataIntervalID);

    this.trackedAircraft.icao24 = icao24;
    this.trackedAircraft.callsign = '';
    console.info(`Start tracking for aircraft '${icao24}'.`);

    this.fetchAircraftState();
    // this.fetchAircraftRoute();
    // this.fetchAircraftData();

    const fetchStateVectorInterval: number = this.hasCredentials ? registeredSatetInterval : defaultStateInterval;
    this.fetchAircraftStateIntervalID = window.setTimeout(this.fetchAircraftState, fetchStateVectorInterval);
  };

  public releaseTrack = (icao24: string) => {

    clearInterval(this.fetchAircraftStateIntervalID);
    clearInterval(this.fetchAircraftRouteIntervalID);
    clearInterval(this.fetchAircraftDataIntervalID);

    this.trackedAircraft.icao24 = '';
    this.trackedAircraft.callsign = '';
    console.info(`Release tracking for aircraft '${icao24}'.`);
  };

  public onAircraftTrackUpdated = (contextKey: string, callbackHandler: AircraftTrackUpdatedCallbackMethod) => {

    // Setup register key
    this.aircraftTrackUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.aircraftTrackUpdatedSubscriptionCounter}`

    // Register callback
    this.aircraftTrackUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    console.debug(`Component with key '${registerKey}' has subscribed on 'AircraftTrackUpdated'.`);
    return registerKey;
  };

  public offAircraftTrackUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.aircraftTrackUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.aircraftTrackUpdatedSubscriberDictionary[registerKey];
      console.debug(`Component with key '${registerKey}' has unsubscribed on 'AircraftTrackUpdated'.`);
      return true;
    }
    else {
      console.error(`Component with key '${registerKey}' not registered on 'AircraftTrackUpdated'.`);
      return false;
    };
  };

  protected async onStarting(): Promise<boolean> {

    // Check for service provider
    if (!this.serviceProvider) {
      this.updateState(ServiceStateEnumeration.Error);
      console.error(`No service provider is injected. Service ${this.key} cannot be started.`);
      return false;
    };

    // Get the REST service
    this.restService = this.serviceProvider.getService<IRESTService>(ServiceKeys.RESTService);
    if (!this.restService) {
      this.updateState(ServiceStateEnumeration.Error);
      console.error(`No REST service is available. Service ${this.key} cannot be started.`);
      return false;
    };

    this.getRequestInit = this.restService.getDefaultRequestInit('GET');
    this.hasCredentials = !!this.clientId && !!this.clientSecret;
    console.info(`Service ${this.key} has credentials: ${this.hasCredentials}`);

    if (this.hasCredentials) {

      this.getRequestInit.mode = 'cors';
      this.getRequestInit.credentials = 'omit';

      this.restService.setAuthorization(async () => {
        const token = await this.getAccessToken();
        return `Bearer ${token}`;
      });
    } else {
      this.restService.setAuthorization(undefined);
    }

    const fetchStateVectorInterval: number = this.hasCredentials ? registeredSatetInterval : defaultStateInterval;
    this.fetchStateVectorsIntervalID = window.setTimeout(this.fetchStateVectors, fetchStateVectorInterval);

    return true;
  };

  protected async onStopping(): Promise<boolean> {

    clearInterval(this.fetchStateVectorsIntervalID);
    clearInterval(this.fetchAircraftStateIntervalID);
    clearInterval(this.fetchAircraftRouteIntervalID);
    clearInterval(this.fetchAircraftDataIntervalID);

    return true;
  };

  private mapRawStateVectorData = (rawData: IStateVectorRawData) => {

    const data: IStateVectorData = {
      time: rawData.time,
      states: []
    };

    if (!rawData.states)
      return data;

    for (var rawStateVector of rawData.states) {

      let changeType = StateVectorChangeTypeEnumeration.None;
      const lastVectorPosition = this.lastPositions.get(rawStateVector[0]);
      if (!lastVectorPosition) {
        changeType = StateVectorChangeTypeEnumeration.PositionChanged;
      }
      else if (lastVectorPosition.latitude !== rawStateVector[6] || lastVectorPosition.longitude !== rawStateVector[5]) {
        changeType = StateVectorChangeTypeEnumeration.PositionChanged;
      }
      else if (lastVectorPosition.tine_state !== rawData.time) {
        changeType = StateVectorChangeTypeEnumeration.OtherChanged;
      }

      this.lastPositions.set(rawStateVector[0], {
        tine_state: rawData.time,
        time_position: rawStateVector[3],
        latitude: rawStateVector[6],
        longitude: rawStateVector[5]
      });

      const stateVector: IStateVector = {
        changeType: changeType,
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
        category: rawStateVector[17],
      }

      data.states.push(stateVector);
    }

    return data;
  };

  private async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      await this.fetchToken();
    }
    return this.accessToken!;
  };

  private async fetchToken(): Promise<void> {

    const response = await fetch(`/oskytokenapi?nocache=${Date.now()}`, { method: "GET" });

    if (!response.ok)
      throw new Error("Proxy OAuth2 token request failed: " + response.statusText);

    const data = await response.json();

    if (!data.access_token || !data.expires_in)
      throw new Error("Token response is missing access_token or expires_in.");

    this.accessToken = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in - 60) * 1000; // 1 minute before expiration
  };

  private fetchStateVectors = () => {

    if (!this.restService)
      return;

    if (this.isFetchingStateVectors)
      return;

    this.isFetchingStateVectors = true;

    var stateBounds = `?extended=1&lamin=${this.geoBounds.southernLatitude}&lomin=${this.geoBounds.westernLongitude}&lamax=${this.geoBounds.northernLatitude}&lomax=${this.geoBounds.easternLongitude}`;
    var targetURL = `${URL}/states/all${stateBounds}`;

    this.restService.get<IStateVectorRawData>(targetURL, this.getRequestInit)
      .then(response => {

        if (response.payload) {

          var mappedData = this.mapRawStateVectorData(response.payload);
          Object.entries(this.stateVectorsUpdatedSubscriberDictionary).forEach(([key, value], index) => value(mappedData))
        }

        this.isFetchingStateVectors = false;
      })
      .finally(() => {

        this.isFetchingStateVectors = false;
        const fetchStateVectorInterval: number = this.hasCredentials ? registeredSatetInterval : defaultStateInterval;
        this.fetchStateVectorsIntervalID = window.setTimeout(this.fetchStateVectors, fetchStateVectorInterval);
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

    this.restService.get<IStateVectorRawData>(targetURL, this.getRequestInit)
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
        const fetchStateVectorInterval: number = this.hasCredentials ? registeredSatetInterval : defaultStateInterval;
        this.fetchAircraftStateIntervalID = window.setTimeout(this.fetchAircraftState, fetchStateVectorInterval);
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

    this.restService.get<any>(targetURL, this.getRequestInit)
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

    this.restService.get<any>(targetURL, this.getRequestInit)
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