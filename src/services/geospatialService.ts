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
  currentPredictionVectorTime: number;
  restartPathPrediction: (stateVectors: IStateVectorData) => void;
  stopPathPrediction: () => void;
  onPathPredictionUpdated: (contextKey: string, callbackHandler: PathPredictionUpdatedCallbackMethod) => string;
  offPathPredictionUpdated: (registerKey: string) => boolean;
};

export class GeospatialService extends Service implements IGeospatialService {

  // IGeospatialService
  public currentPredictionVectorTime: number = 0;

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
    clearInterval(this.pathPredictionIntervalID);
    this.currentPredictionVectorTime = stateVectors.time;
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
    const now = stateVectors.time;

    for (const stateVector of stateVectors.states) {

      const key = stateVector.icao24;
      const lastState = this.predictionStates.get(key);

      let isNewPosition = false;
      if (
        lastState &&
        lastState.lastKnown.lat === stateVector.latitude &&
        lastState.lastKnown.lon === stateVector.longitude &&
        lastState.lastKnown.time === stateVector.time_position
      ) {
        // No new data -> Predict from last prediction
        lastState.staleCount += 1;
      } else {
        // Received new position data
        isNewPosition = true;
      }

      // Extract current values
      const lat = stateVector.latitude ?? (lastState?.lastPredicted.lat ?? 0);
      const lon = stateVector.longitude ?? (lastState?.lastPredicted.lon ?? 0);
      const time = stateVector.time_position ?? now;
      const velocity = stateVector.velocity ?? lastState?.velocity ?? 0;
      const bearing = stateVector.true_track ?? lastState?.bearing ?? 0;
      const verticalRate = stateVector.vertical_rate ?? lastState?.verticalRate ?? 0;
      let altitude = stateVector.geo_altitude;
      if (altitude == null || altitude < 0) altitude = stateVector.baro_altitude;
      if (altitude == null || altitude < 0) altitude = lastState?.altitude ?? 0;

      // Prediction calculation
      let origin: [number, number];
      let predictionTime: number;
      let dt: number; // Time in seconds since last update

      if (lastState && !isNewPosition) {
        origin = [lastState.lastPredicted.lon, lastState.lastPredicted.lat];
        predictionTime = lastState.lastPredicted.time + this.pathPredictionInterval / 1000;
        dt = this.pathPredictionInterval / 1000;
      } else {
        origin = [lon, lat];
        predictionTime = time;
        dt = 0;
      }

      // Calculate distance based on velocity and time (velocity = m/s * dt)
      let distance = velocity * dt;
      if (verticalRate !== 0) distance -= (verticalRate * dt);
      if (altitude > 0) distance = (distance * earthRadius) / (earthRadius + altitude);

      const predicted = destination(origin, distance, bearing, { units: "meters" });

      // Properties for assignment
      predicted.properties = { icao24: stateVector.icao24 };

      // Update prediction state 
      this.predictionStates.set(key, {
        lastKnown: isNewPosition ? { lat, lon, time } : lastState?.lastKnown ?? { lat, lon, time },
        lastPredicted: {
          lat: predicted.geometry.coordinates[1],
          lon: predicted.geometry.coordinates[0],
          time: predictionTime,
        },
        velocity, bearing, verticalRate, altitude,
        staleCount: isNewPosition ? 0 : (lastState?.staleCount ?? 0) + 1,
      });

      features.push(predicted);
    }

    // Trigger callbacks
    Object.values(this.pathPredictionUpdatedSubscriberDictionary).forEach(cb => cb(features));
  };
}
