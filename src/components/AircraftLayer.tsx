import React from 'react';
import { Source, Layer } from 'react-map-gl';
import { FeatureCollection, Feature, GeoJsonProperties, Point, Position } from 'geojson';
import { SymbolLayout, SymbolPaint } from 'mapbox-gl';
import { useTheme } from '@material-ui/core/styles';

import { IStateVectorData } from '../opensky';

interface ILocalProps {
  stateVectors: IStateVectorData;
  selectedICAO24?: string;
}
type Props = ILocalProps;

const AircraftLayer: React.FC<Props> = (props) => {

  // External hooks
  const theme = useTheme();

  const createFeatureCollection = () => {

    var featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    for (var stateVector of props.stateVectors.states) {

      if (!stateVector.latitude)
        continue;

      if (!stateVector.longitude)
        continue;

      var index = props.stateVectors.states.indexOf(stateVector);
      var isSelected = false;
      if (props.selectedICAO24)
        isSelected = stateVector.icao24 === props.selectedICAO24;

      var properties: GeoJsonProperties = {
        ['isSelected']: isSelected,
        ['color']: isSelected ? theme.palette.success.main : theme.palette.secondary.main,
        ['icao24']: stateVector.icao24,
        ['callsign']: stateVector.callsign ? stateVector.callsign : stateVector.icao24,
        ['true_track']: stateVector.true_track ? stateVector.true_track : 0.0
      }

      var position: Position = [stateVector.longitude, stateVector.latitude];

      var point: Point = {
        type: 'Point',
        coordinates: position
      };

      var feature: Feature = {
        type: 'Feature',
        id: `[${index}].[${stateVector.icao24}]`,
        geometry: point,
        properties: properties
      }

      featureCollection.features.push(feature);
    }

    return featureCollection;
  };

  const getSymbolLayout = () => {

    var symbolLayout: SymbolLayout = {
      "icon-image": "aircraft-icon",
      "icon-allow-overlap": true,
      "icon-rotate": ["get", "true_track"],
      "text-field": ["get", "callsign"],
      "text-allow-overlap": true,
      "text-anchor": 'top',
      "text-offset": [0, 1]
    };

    return symbolLayout;
  };

  const getSymbolPaint = () => {

    var symbolPaint: SymbolPaint = {
      "icon-color": ["get", "color"],
      "text-color": ["get", "color"]
    };

    return symbolPaint;
  };

  if (!props.stateVectors.states)
    return null;

  return (

    <Source
      type="geojson"
      data={createFeatureCollection()}>

      <Layer
        id='aircrafts'
        type='symbol'
        source='geojson'
        layout={getSymbolLayout()}
        paint={getSymbolPaint()} />
    </Source>
  )
}

export default AircraftLayer;