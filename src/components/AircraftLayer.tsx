import React, { useState, useContext, useRef, useEffect } from 'react';
import { Source, Layer } from 'react-map-gl';
import { FeatureCollection, Geometry, Feature, GeoJsonProperties, Point, Position } from 'geojson';
import { SymbolLayout, SymbolPaint, Expression, StyleFunction } from 'mapbox-gl';
import { SystemContext } from '@daniel.neuweiler/react-lib-module';
import { useTheme } from '@mui/material/styles';

import { IGeospatialService } from './../services';
import { IStateVectorData, IAircraftTrack } from '../opensky';
import { getFormattedValue, getIconName, getRotation, getColor } from '../helpers';

interface ILocalProps {
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
  const systemContext = useContext(SystemContext)
  const geospatialService = systemContext.getService<IGeospatialService>('GeospatialService');

  // Refs
  const pathPredictionSubscriptionRef = useRef<string>('');

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

    createFeatureCollection(pathPredictions).then((featureCollection) => {

      setFeatureCollection(featureCollection);

      if (!geospatialService)
        return;

      if (props.stateVectors.states.length > 1000) {
        geospatialService.stopPathPrediction();
      }
      else {
        geospatialService.restartPathPrediction(props.stateVectors);
      }
    })



  }, [props.stateVectors]);
  useEffect(() => {

    createFeatureCollection(pathPredictions).then((featureCollection) => {

      setFeatureCollection(featureCollection);
    })

  }, [pathPredictions]);

  const handlePathPredictionUpdated = (destinations: Array<Feature<Point, GeoJsonProperties>>) => {
    setPathPredictions(destinations);
  };

  const createFeatureCollection = (pathPredictions: Array<Feature<Point, GeoJsonProperties>>) => {

    return new Promise<FeatureCollection>((res, rej) => {

      var featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
      };

      for (var stateVector of props.stateVectors.states) {

        if (!stateVector.latitude) {
          continue;
        }

        if (!stateVector.longitude) {
          continue;
        }

        // Get the index
        const index = props.stateVectors.states.indexOf(stateVector);

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
      }

      res(featureCollection);
    });

  };

  const getText = (): string | Expression | StyleFunction => {

    var text: string | Expression | StyleFunction = '';
    const simpleText = ["get", "callsign"] as Expression
    const detailedText = ['format',
      ["get", "callsign"], { "font-scale": 1.0 },
      "\n", {},
      ["get", "altitude"], { "font-scale": 0.75, "text-color": styleTheme.palette.text.primary },
      "\n", {},
      ["get", "velocity"], { "font-scale": 0.75, "text-color": styleTheme.palette.text.primary }
    ] as StyleFunction;

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

    const symbolLayout: SymbolLayout = {
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

    var symbolPaint: SymbolPaint = {
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