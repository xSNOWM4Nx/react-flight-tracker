import destination from '@turf/destination';
import { Service } from './infrastructure/service.js';
import { StateVectorChangeTypeEnumeration } from '../opensky/types.js';

// Types
import type { IService } from './infrastructure/serviceTypes.js';
import type { Feature, GeoJsonProperties, Point } from 'geojson';
import type { IStateVectorData, IAircraftTrack, IStateVector } from '../opensky/types.js';

// Earth radius in meters
const earthRadius = 6371008.8;

export type PathPredictionUpdatedCallbackMethod = (destinations: Array<Feature<Point, GeoJsonProperties>>) => void;
interface IPathPredictionUpdatedSubscriberDictionary { [key: string]: PathPredictionUpdatedCallbackMethod };

type PredictionState = {
  lastKnown: { lat: number, lon: number, time: number },
  lastPredicted: { lat: number, lon: number, time: number },
  velocity: number,
  bearing: number,
  verticalRate: number,
  altitude: number,
  staleCount: number
};

export interface IGeospatialService extends IService {
  restartPathPrediction: (stateVectors: IStateVectorData) => void;
  stopPathPrediction: () => void;
  onPathPredictionUpdated: (contextKey: string, callbackHandler: PathPredictionUpdatedCallbackMethod) => string;
  offPathPredictionUpdated: (registerKey: string) => boolean;
};

export class GeospatialService extends Service implements IGeospatialService {

  // Props
  private pathPredictionInterval: number = 200;
  private pathPredictionIntervalID: number = 0;
  private pathPredictionUpdatedSubscriberDictionary: IPathPredictionUpdatedSubscriberDictionary = {};
  private pathPredictionUpdatedSubscriptionCounter: number = 0;
  private predictionStates: Map<string, PredictionState> = new Map();

  constructor(key: string) {
    super(key);

  };

  public restartPathPrediction = (stateVectors: IStateVectorData) => {

    // Clear any existing prediction interval
    clearInterval(this.pathPredictionIntervalID);

    // Check for active keys (icao24)
    const activeKeys = new Set<string>();

    for (const stateVector of stateVectors.states) {

      const key = stateVector.icao24;
      const lastState = this.predictionStates.get(key);
      activeKeys.add(key);

      // Adjust the prediction states
      // Start from the current position if the position has changed or if there is no last state
      if (stateVector.changeType === StateVectorChangeTypeEnumeration.PositionChanged ||
        !lastState) {

        this.predictionStates.set(key, {
          lastKnown: {
            lat: stateVector.latitude ?? 0,
            lon: stateVector.longitude ?? 0,
            time: stateVector.time_position ?? stateVectors.time
          },
          lastPredicted: {
            lat: stateVector.latitude ?? 0,
            lon: stateVector.longitude ?? 0,
            time: stateVector.time_position ?? stateVectors.time
          },
          velocity: stateVector.velocity ?? 0,
          bearing: stateVector.true_track ?? 0,
          verticalRate: stateVector.vertical_rate ?? 0,
          altitude: stateVector.geo_altitude ?? stateVector.baro_altitude ?? 0,
          staleCount: 0
        });
      }
    };

    // Optionally remove prediction states that are no longer active
    for (const existingKey of Array.from(this.predictionStates.keys())) {
      if (!activeKeys.has(existingKey)) {
        this.predictionStates.delete(existingKey);
      }
    }

    // Restart the prediction process
    this.pathPredictionIntervalID = window.setTimeout(this.calculatePath, this.pathPredictionInterval, stateVectors);
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
    const existingSubscriber = Object.entries(this.pathPredictionUpdatedSubscriberDictionary).find(([key, value]) => key === registerKey);
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

    for (const stateVector of stateVectors.states) {

      const key = stateVector.icao24;
      const predictionState = this.predictionStates.get(key);
      if (!predictionState) {
        continue;
      }

      // Values for prediction
      const lastPred = predictionState.lastPredicted;
      const velocity = predictionState.velocity;
      const bearing = predictionState.bearing;
      const verticalRate = predictionState.verticalRate;
      const altitude = predictionState.altitude;
      const staleCount = predictionState.staleCount;

      // Time difference in seconds
      const dt = this.pathPredictionInterval / 1000;
      const newTime = lastPred.time + dt;

      // Origin: last predicted position
      const origin: [number, number] = [lastPred.lon, lastPred.lat];

      // Calculate distance based on velocity and vertical rate
      let distance = velocity * dt;
      if (verticalRate !== 0) distance -= (verticalRate * dt);
      if (altitude > 0) distance = (distance * earthRadius) / (earthRadius + altitude);

      // Calculate the destination point
      const predicted = destination(origin, distance, bearing, { units: "meters" });
      predicted.properties = { icao24: key };

      // Update last predicted position and time
      this.predictionStates.set(key, {
        ...predictionState,
        lastPredicted: {
          lat: predicted.geometry.coordinates[1],
          lon: predicted.geometry.coordinates[0],
          time: newTime,
        },
        staleCount: staleCount + 1,
      });

      features.push(predicted);
    }

    // Callbacks
    Object.values(this.pathPredictionUpdatedSubscriberDictionary).forEach(cb => cb(features));

    // Trigger the next path calculation after the defined interval
    this.pathPredictionIntervalID = window.setTimeout(this.calculatePath, this.pathPredictionInterval, stateVectors);
  };
}
