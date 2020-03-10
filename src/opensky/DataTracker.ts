import { IRESTService } from '@mymodules/ts-lib-module';
import {
  IStateVectorData, IStateVectorRawData, IStateVector,
  IAircraftFlight, IAircraftFullTrack,
  IMapGeoBounds
} from './types';
import { URL, Constants } from './constants';

export interface IDataTracker {
  geoBounds: IMapGeoBounds;
  setOpenSkyCredentials: (userName?: string, password?: string) => void;
  clearOpenSkyCredentials: () => void;
  start: () => void;
  stop: () => void;
  onStateVectorsUpdated: (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => void;
  offStateVectorsUpdated: (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => void;
  trackAircraft: (icao24: string) => void;
  onAircraftTrackUpdated: (caller: string, callbackHandler: (track: IAircraftFullTrack) => void) => void;
  offAircraftTrackUpdated: (caller: string, callbackHandler: (track: IAircraftFullTrack) => void) => void;
}

export class DataTracker implements IDataTracker {

  // IDataTracker
  public geoBounds: IMapGeoBounds;

  // Props
  private restService: IRESTService;
  private hasCredentials: boolean = false;
  private fetchStateVectorIntervalID: number = 0;
  private fetchAircraftTrackIntervalID: number = 0;
  private isFetchingStateVectors: boolean = false;
  private trackedAircraft: IAircraftFullTrack;
  private onStateVectorUpdateSubscribers: Array<(stateVectors: IStateVectorData) => void> = [];
  private onAircraftTrackUpdateSubscribers: Array<(track: IAircraftFullTrack) => void> = [];

  constructor(restService: IRESTService) {

    this.restService = restService;

    this.geoBounds = {
      southernLatitude: Constants.DEFAULT_MIN_LATITUDE,
      northernLatitude: Constants.DEFAULT_MAX_LATITUDE,
      westernLongitude: Constants.DEFAULT_MIN_LONGITUDE,
      easternLongitude: Constants.DEFAULT_MAX_LONGITUDE
    };

    this.trackedAircraft = {
      icao24: '',
      flights: []
    }
  };

  public start = () => {

    this.fetchStateVectorIntervalID = window.setInterval(this.fetchStateVectors, 5000);
    this.fetchAircraftTrackIntervalID = window.setInterval(this.fetchAircraftTrack, 30000);

    this.fetchStateVectors();
  };

  public stop = () => {

    clearInterval(this.fetchStateVectorIntervalID)
    clearInterval(this.fetchAircraftTrackIntervalID)
  };

  public setOpenSkyCredentials = (userName?: string, password?: string) => {

    this.restService.setAuthorization(`Basic ${btoa(`${userName}:${password}`)}`);
    this.hasCredentials = true;
  };

  public clearOpenSkyCredentials = () => {

    this.restService.setAuthorization('');
    this.hasCredentials = false;
  };

  public onStateVectorsUpdated = (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => {

    var index = this.onStateVectorUpdateSubscribers.indexOf(callbackHandler);
    if (index < 0)
      this.onStateVectorUpdateSubscribers.push(callbackHandler);
  };

  public offStateVectorsUpdated = (caller: string, callbackHandler: (stateVectors: IStateVectorData) => void) => {

    var index = this.onStateVectorUpdateSubscribers.indexOf(callbackHandler);
    if (index >= 0)
      this.onStateVectorUpdateSubscribers.splice(index, 1);
  };

  public trackAircraft = (icao24: string) => {

    this.trackedAircraft.icao24 = icao24;
    console.log(this.trackedAircraft)
    this.fetchAircraftTrack();
  };

  public onAircraftTrackUpdated = (caller: string, callbackHandler: (track: IAircraftFullTrack) => void) => {

    var index = this.onAircraftTrackUpdateSubscribers.indexOf(callbackHandler);
    if (index < 0)
      this.onAircraftTrackUpdateSubscribers.push(callbackHandler);
  };

  public offAircraftTrackUpdated = (caller: string, callbackHandler: (track: IAircraftFullTrack) => void) => {

    var index = this.onAircraftTrackUpdateSubscribers.indexOf(callbackHandler);
    if (index >= 0)
      this.onAircraftTrackUpdateSubscribers.splice(index, 1);
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

  private fetchAircraftTrack = () => {

    if (this.trackedAircraft.icao24 === '')
      return;

    var startDate = new Date(Date.now());
    startDate.setUTCHours(startDate.getUTCHours() - 24);
    var beginTime = Math.floor(startDate.getTime() / 1000);

    var endDate = new Date(Date.now());
    var endTime = Math.floor(endDate.getTime() / 1000);

    var targetURL = `${URL}/flights/aircraft?icao24=${this.trackedAircraft.icao24}&begin=${beginTime}&end=${endTime}`;

    this.restService.get<Array<IAircraftFlight>>(targetURL, {
      mode: 'cors',
      credentials: this.hasCredentials ? 'include' : 'omit'
    })
      .then(response => {

        if (response.payload) {

          this.trackedAircraft.flights = response.payload;

          console.log('----------->');
          console.log(this.trackedAircraft);

          this.onAircraftTrackUpdateSubscribers.forEach(callback => callback(this.trackedAircraft))
        }
      })
      .finally(() => {

      })
  };
}