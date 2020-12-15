import { IService, Service, IResponse, createResponse, ResponseStateEnumeration } from '@daniel.neuweiler/ts-lib-module';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import destination from '@turf/destination';

import { IStateVectorData, IAircraftTrack, IStateVector } from '../opensky';

// Earth radius in meters
const earthRadius = 6371008.8;

export type PathPredictionUpdatedCallbackMethod = (destinations: Array<Feature<Point, GeoJsonProperties>>) => void;
interface IPathPredictionUpdatedSubscriberDictionary { [key: string]: PathPredictionUpdatedCallbackMethod };

export interface IGeospatialService extends IService {
  restartPathPrediction: (stateVectors: IStateVectorData) => void;
  stopPathPrediction: () => void;
  onPathPredictionUpdated: (contextKey: string, callbackHandler: PathPredictionUpdatedCallbackMethod) => string;
  offPathPredictionUpdated: (registerKey: string) => boolean;
};

export class GeospatialService extends Service implements IGeospatialService {

  // Props
  private pathPredictionInterval: number = 100;
  private pathPredictionCounter: number = 0;
  private pathPredictionIntervalID: number = 0;
  private pathPredictionUpdatedSubscriberDictionary: IPathPredictionUpdatedSubscriberDictionary = {};
  private pathPredictionUpdatedSubscriptionCounter: number = 0;

  constructor() {
    super('GeospatialService');

  };

  public restartPathPrediction = (stateVectors: IStateVectorData) => {

    clearInterval(this.pathPredictionIntervalID);
    this.pathPredictionCounter = 0;
    this.pathPredictionIntervalID = window.setInterval(this.calculatePath, this.pathPredictionInterval, stateVectors);
  };

  public stopPathPrediction = () => {

    clearInterval(this.pathPredictionIntervalID);
  };

  public onPathPredictionUpdated = (contextKey: string, callbackHandler: PathPredictionUpdatedCallbackMethod) => {

    // Setup register key
    this.pathPredictionUpdatedSubscriptionCounter++;
    const registerKey = `${contextKey}_${this.pathPredictionUpdatedSubscriptionCounter}`

    // Register callback
    this.pathPredictionUpdatedSubscriberDictionary[registerKey] = callbackHandler;
    this.logger.debug(`Component with key '${registerKey}' has subscribed on 'PathPredictionUpdated'.`);
    this.logger.debug(`'${Object.entries(this.pathPredictionUpdatedSubscriberDictionary).length}' subscribers on 'PathPredictionUpdated'.`);

    return registerKey;
  };

  public offPathPredictionUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.pathPredictionUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.pathPredictionUpdatedSubscriberDictionary[registerKey];
      this.logger.debug(`Component with key '${registerKey}' has unsubscribed on 'PathPredictionUpdated'.`);
      this.logger.debug(`'${Object.entries(this.pathPredictionUpdatedSubscriberDictionary).length}' subscribers on 'PathPredictionUpdated'.`);

      return true;
    }
    else {

      this.logger.error(`Component with key '${registerKey}' not registered on 'PathPredictionUpdated'.`);
      this.logger.debug(`'${Object.entries(this.pathPredictionUpdatedSubscriberDictionary).length}' subscribers on 'PathPredictionUpdated'.`);

      return false;
    };
  };

  protected async onStarting(): Promise<IResponse<boolean>> {
    return createResponse<boolean>(true, ResponseStateEnumeration.OK, []);
  };

  protected async onStopping(): Promise<IResponse<boolean>> {

    clearInterval(this.pathPredictionIntervalID);

    return createResponse<boolean>(true, ResponseStateEnumeration.OK, []);
  };

  private calculatePath = (stateVectors: IStateVectorData) => {

    const features: Array<Feature<Point, GeoJsonProperties>> = [];

    for (var stateVector of stateVectors.states) {

      // Setup last position time in ms
      var lastPositionTime = this.pathPredictionCounter

      // Setup altitude in m
      var altitude = stateVector.geo_altitude;
      if ((altitude === null) || (altitude < 0))
        altitude = stateVector.baro_altitude;
      if ((altitude === null) || (altitude < 0))
        altitude = 0;

      // Setup vertical rate
      var verticalRate = stateVector.vertical_rate ? stateVector.vertical_rate : 0.0;
      if (verticalRate < 0)
        verticalRate *= -1;

      const origin: Array<number> = [stateVector.longitude ? stateVector.longitude : 0, stateVector.latitude ? stateVector.latitude : 0]
      const velocity = stateVector.velocity ? stateVector.velocity : 0;

      var distance = (velocity * lastPositionTime) / 1000;

      // Try to adjust the distance to the vertical rate
      if (verticalRate !== 0)
        distance = distance - (verticalRate * (lastPositionTime / 1000));

      // Try to adjust the distance to the altitude
      if (altitude > 0)
        distance = (distance * earthRadius) / (earthRadius + altitude);

      const bearing = stateVector.true_track ? stateVector.true_track : 0;

      // Calculate the destination
      const feature = destination(
        origin,
        distance,
        bearing,
        {
          units: "meters"
        }
      );

      // Adding the ICAO24 prop to the feature so that a corresponding assignment is possible later
      var properties: GeoJsonProperties = {
        ['icao24']: stateVector.icao24
      };
      feature.properties = properties;

      // Push the feature to the collection
      features.push(feature);
    }

    // Increase counter time
    this.pathPredictionCounter += this.pathPredictionInterval;

    // Execute callbacks
    Object.entries(this.pathPredictionUpdatedSubscriberDictionary).forEach(([key, value], index) => value(features))
  };
}
