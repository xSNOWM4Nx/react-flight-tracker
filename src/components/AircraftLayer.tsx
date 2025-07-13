import React, { useState, useContext, useRef, useEffect } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import { useTheme } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { getFormattedValue, getIconName, getRotation, getColor } from '../helpers/aircraftDataFunctions.js';

// Types
import type { SymbolLayerSpecification, ExpressionSpecification, StyleSpecification } from 'mapbox-gl';
import type { ViewState } from 'react-map-gl/mapbox';
import type { FeatureCollection, Feature, GeoJsonProperties, Point, Position } from 'geojson';
import type { IGeospatialService } from './../services/geospatialService.js';
import type { IStateVectorData, IAircraftTrack } from '../opensky/types.js';

interface ILocalProps {
  viewState: ViewState;
  stateVectors: IStateVectorData;
  zoom?: number;
  selectedAircraft?: IAircraftTrack;
}
type Props = ILocalProps;

export const aircraftLayerId = 'aircrafts';

const AircraftLayer: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'AircraftLayer'

  // External hooks
  const styleTheme = useTheme();

  // States
  const [featureCollection, setFeatureCollection] = useState<FeatureCollection | undefined>(undefined);
  const [pathPredictions, setPathPredictions] = useState<Array<Feature<Point, GeoJsonProperties>>>([]);

  // Contexts
  const appContext = useContext(AppContext)
  const geospatialService = appContext.getService<IGeospatialService>(ServiceKeys.GeospatialService);

  // Refs
  const pathPredictionSubscriptionRef = useRef<string>('');
  const predictionTimeRef = useRef<number | undefined>(undefined);

  // Effects
  useEffect(() => {

    // Mount
    if (geospatialService) {

      // Get a register key for the subscription and save it as reference
      const registerKey = geospatialService.onPathPredictionUpdated(contextName, handlePathPredictionUpdated);
      pathPredictionSubscriptionRef.current = registerKey;
    }

    // Unmount
    return () => {

      if (geospatialService) {

        geospatialService.stopPathPrediction();

        // Get the register key from the reference to unsubscribe
        const registerKey = pathPredictionSubscriptionRef.current;
        geospatialService.offPathPredictionUpdated(registerKey);
      }
    }
  }, []);
  useEffect(() => {

    const featureCollection = createFeatureCollection(props.stateVectors, pathPredictions);
    setFeatureCollection(featureCollection);

  }, [props.stateVectors.time, pathPredictions]);
  useEffect(() => {

    if (!geospatialService)
      return;

    const enablePathPrediction = appContext.pullSetting(SettingKeys.EnablePathPrediction) as boolean;
    if (!enablePathPrediction)
      return;

    if (props.stateVectors.states.length > 500) {
      geospatialService.stopPathPrediction();
      setPathPredictions([]);
      return;
    }

    geospatialService.restartPathPrediction(props.stateVectors);

  }, [props.stateVectors.time]);
  useEffect(() => {

    if (!geospatialService)
      return;

    const enablePathPrediction = appContext.pullSetting(SettingKeys.EnablePathPrediction) as boolean;
    if (enablePathPrediction)
      return;

    geospatialService.stopPathPrediction();
    setPathPredictions([]);

  }, [appContext]);

  const handlePathPredictionUpdated = (destinations: Array<Feature<Point, GeoJsonProperties>>) => {
    setPathPredictions(destinations);
  };

  const createFeatureCollection = (stateVectors: IStateVectorData, pathPredictions: Array<Feature<Point, GeoJsonProperties>>) => {

    var featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    for (var stateVector of stateVectors.states) {

      if (!stateVector.latitude) {
        continue;
      }

      if (!stateVector.longitude) {
        continue;
      }

      // Get the index
      const index = stateVectors.states.indexOf(stateVector);

      // Check for selection
      var isSelected = false;
      if (props.selectedAircraft)
        isSelected = stateVector.icao24 === props.selectedAircraft.icao24;

      // Get callsign
      const callsign = stateVector.callsign ? stateVector.callsign : stateVector.icao24;

      // Get altitude
      var altitude = stateVector.geo_altitude;
      if ((altitude === null) || (altitude < 0))
        altitude = stateVector.baro_altitude;
      if ((altitude === null) || (altitude < 0))
        altitude = 0;

      // Get velocity in km/h
      const velocity = stateVector.velocity ? (stateVector.velocity * 3.6) : -1;

      // Get true track
      const trueTrack = stateVector.true_track ? stateVector.true_track : 0.0;

      // Get vertical rate
      const verticalRate = stateVector.vertical_rate ? stateVector.vertical_rate : 0.0;

      // Get is on ground
      const isOnGround = stateVector.on_ground;

      // Claculate color
      var color = getColor(altitude);
      if (isOnGround)
        color = styleTheme.palette.text.secondary;
      if (isSelected)
        color = styleTheme.palette.primary.main;

      var properties: GeoJsonProperties = {
        ['iconName']: getIconName(isOnGround, verticalRate, altitude, trueTrack),
        ['rotation']: getRotation(trueTrack, verticalRate, altitude),
        ['color']: color,
        ['isSelected']: isSelected,
        ['icao24']: stateVector.icao24,
        ['callsign']: callsign,
        ['altitude']: getFormattedValue(altitude, 1) + " m",
        ['velocity']: getFormattedValue(velocity, 1) + " km/h"
      }

      // Setup WGS84 coordinates
      var position: Position = [stateVector.longitude, stateVector.latitude];

      if (pathPredictions.length > 0) {

        const feature = pathPredictions.find(feature => feature.properties !== null && feature.properties['icao24']! === stateVector.icao24);
        if (feature)
          position = feature.geometry.coordinates;
      }

      var point: Point = {
        type: 'Point',
        coordinates: position
      };

      var feature: Feature<Point, GeoJsonProperties> = {
        type: 'Feature',
        id: `${index}.${stateVector.icao24}`,
        geometry: point,
        properties: properties
      }

      featureCollection.features.push(feature);
    };

    return featureCollection;
  };

  const getText = (): string | ExpressionSpecification => {

    let text: string | ExpressionSpecification = '';
    const simpleText: ExpressionSpecification = ["get", "callsign"];
    const detailedText: ExpressionSpecification = [
      'format',
      ["get", "callsign"], { "font-scale": 1.0 },
      "\n", {},
      ["get", "altitude"], { "font-scale": 0.75, "text-color": styleTheme.palette.text.primary },
      "\n", {},
      ["get", "velocity"], { "font-scale": 0.75, "text-color": styleTheme.palette.text.primary }
    ];

    if (props.zoom && props.zoom > 7)
      text = simpleText;
    if (props.zoom && props.zoom > 9)
      text = detailedText;

    return text;
  };

  const getSymbolLayout = () => {

    var showText = false;
    if (props.zoom && props.zoom > 7)
      showText = true;

    var isconSize = 1.0;
    if (props.zoom && props.zoom > 7)
      isconSize = 1.3;
    if (props.zoom && props.zoom > 9)
      isconSize = 1.6;

    const symbolLayout: SymbolLayerSpecification['layout'] = {
      "icon-image": ["get", "iconName"],
      "icon-allow-overlap": true,
      "icon-rotate": ["get", "rotation"],
      "icon-size": isconSize,
      "text-field": showText ? getText() : '',
      "text-optional": true,
      "text-allow-overlap": true,
      "text-anchor": showText ? 'top' : 'center',
      "text-offset": showText ? [0, 1] : [0, 0]
    };

    return symbolLayout;
  };

  const getSymbolPaint = () => {

    var symbolPaint: SymbolLayerSpecification['paint'] = {
      "icon-color": ["get", "color"],
      "text-color": ["get", "color"],
      "text-halo-width": 2,
      "text-halo-color": styleTheme.palette.background.default,
      "text-halo-blur": 2
    };

    return symbolPaint;
  };

  if (!props.stateVectors.states)
    return null;

  return (

    <Source
      type="geojson"
      data={featureCollection}>

      <Layer
        id={aircraftLayerId}
        type='symbol'
        source='geojson'
        layout={getSymbolLayout()}
        paint={getSymbolPaint()} />
    </Source>
  )
}

export default AircraftLayer;