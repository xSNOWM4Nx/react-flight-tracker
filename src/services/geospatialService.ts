import destination from '@turf/destination';
import { Service } from './infrastructure/service.js';

// Types
import type { IService } from './infrastructure/serviceTypes.js';
import type { Feature, GeoJsonProperties, Point } from 'geojson';
import type { IStateVectorData, IAircraftTrack, IStateVector } from '../opensky/types.js';

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

  constructor(key: string) {
    super(key);

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
    console.debug(`Component with key '${registerKey}' has subscribed on 'PathPredictionUpdated'.`);

    return registerKey;
  };

  public offPathPredictionUpdated = (registerKey: string) => {

    // Delete callback
    var existingSubscriber = Object.entries(this.pathPredictionUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
    if (existingSubscriber) {

      delete this.pathPredictionUpdatedSubscriberDictionary[registerKey];
      console.debug(`Unsubscribing component with key '${registerKey}' from 'PathPredictionUpdated'.`);
      return true;
    }
    else {
      console.warn(`Unsubscribing component with key '${registerKey}' from 'PathPredictionUpdated' failed.`);
      return false;
    };
  };

  protected async onStarting(): Promise<boolean> {
    return true;
  };

  protected async onStopping(): Promise<boolean> {
    clearInterval(this.pathPredictionIntervalID);
    return true;
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
