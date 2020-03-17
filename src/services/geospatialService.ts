import { IService, Service } from '@daniel.neuweiler/ts-lib-module';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import destination from '@turf/destination';

import { IStateVectorData, IAircraftTrack, IStateVector } from '../opensky';

// Earth radius in meters
const earthRadius = 6371008.8;

export interface IGeospatialService extends IService {
  restartPathPrediction: (stateVectors: IStateVectorData) => void;
  stopPathPrediction: () => void;
  onPathPredictionUpdated: (caller: string, callbackHandler: (destinations: Array<Feature<Point, GeoJsonProperties>>) => void) => void;
  offPathPredictionUpdated: (caller: string, callbackHandler: (destinations: Array<Feature<Point, GeoJsonProperties>>) => void) => void;
};

export class GeospatialService extends Service implements IGeospatialService {

  // Props
  private pathPredictionInterval: number = 100;
  private pathPredictionCounter: number = 0;
  private pathPredictionIntervalID: number = 0;
  private onPathPredictionUpdateSubscribers: Array<(destinations: Array<Feature<Point, GeoJsonProperties>>) => void> = [];

  constructor() {
    super('GeospatialService');

  };

  public async stop() {

    clearInterval(this.pathPredictionIntervalID);

    var superResponse = await super.stop();
    return superResponse;
  };

  public restartPathPrediction = (stateVectors: IStateVectorData) => {

    clearInterval(this.pathPredictionIntervalID);
    this.pathPredictionCounter = 0;
    this.pathPredictionIntervalID = window.setInterval(this.calculatePath, this.pathPredictionInterval, stateVectors);
  };

  public stopPathPrediction = () => {

    clearInterval(this.pathPredictionIntervalID);
  };

  public onPathPredictionUpdated = (caller: string, callbackHandler: (destinations: Array<Feature<Point, GeoJsonProperties>>) => void) => {

    var index = this.onPathPredictionUpdateSubscribers.indexOf(callbackHandler);
    if (index < 0)
      this.onPathPredictionUpdateSubscribers.push(callbackHandler);

    this.logger.debug(`'${caller}' has subscribed for 'PathPredictionUpdated'.`);
    this.logger.debug(`'${this.onPathPredictionUpdateSubscribers.length}' subscribers for 'PathPredictionUpdated'.`);
  };

  public offPathPredictionUpdated = (caller: string, callbackHandler: (destinations: Array<Feature<Point, GeoJsonProperties>>) => void) => {

    var index = this.onPathPredictionUpdateSubscribers.indexOf(callbackHandler);
    if (index >= 0)
      this.onPathPredictionUpdateSubscribers.splice(index, 1);

    this.logger.debug(`'${caller}' has unsubscribed for 'PathPredictionUpdated'.`);
    this.logger.debug(`'${this.onPathPredictionUpdateSubscribers.length}' subscribers for 'PathPredictionUpdated'.`);
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
    this.onPathPredictionUpdateSubscribers.forEach(callback => callback(features))
  };
}
