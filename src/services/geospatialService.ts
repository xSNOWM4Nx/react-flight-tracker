import { IService, Service } from '@daniel.neuweiler/ts-lib-module';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import destination from '@turf/destination';

import { IStateVectorData, IAircraftTrack, IStateVector } from '../opensky';

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

    this.pathPredictionCounter += this.pathPredictionInterval;
    const features: Array<Feature<Point, GeoJsonProperties>> = [];

    for (var stateVector of stateVectors.states) {

      const origin: Array<number> = [stateVector.longitude ? stateVector.longitude : 0, stateVector.latitude ? stateVector.latitude : 0]
      const velocity = stateVector.velocity ? stateVector.velocity : 0;
      const distance = (velocity * this.pathPredictionCounter) / 1000;
      const bearing = stateVector.true_track ? stateVector.true_track : 0;

      const feature = destination(
        origin,
        distance,
        bearing,
        {
          units: "meters"
        }
      );

      var properties: GeoJsonProperties = {
        ['icao24']: stateVector.icao24
      };

      feature.properties = properties;
      features.push(feature);
    }

    this.onPathPredictionUpdateSubscribers.forEach(callback => callback(features))
  };
}
