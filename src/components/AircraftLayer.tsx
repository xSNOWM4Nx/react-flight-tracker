import React from 'react';
import { Source, Layer } from 'react-map-gl';
import { FeatureCollection, Feature, GeoJsonProperties, Point, Position } from 'geojson';
import { SymbolLayout, SymbolPaint, Expression, StyleFunction } from 'mapbox-gl';
import { useTheme } from '@material-ui/core/styles';

import { IStateVectorData, IAircraftTrack, IStateVector } from '../opensky';

interface ILocalProps {
  stateVectors: IStateVectorData;
  zoom?: number;
  selectedAircraft?: IAircraftTrack;
}
type Props = ILocalProps;

const defaultNumberFormatter = new Intl.NumberFormat('de-CH', { style: 'decimal', useGrouping: false, maximumFractionDigits: 1 });

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

      // Get the index
      const index = props.stateVectors.states.indexOf(stateVector);

      // Check for selection
      var isSelected = false;
      if (props.selectedAircraft)
        isSelected = stateVector.icao24 === props.selectedAircraft.icao24;

      // Get true track
      const trueTrack = stateVector.true_track ? stateVector.true_track : 0.0;

      // Get callsign
      const callsign = stateVector.callsign ? stateVector.callsign : stateVector.icao24;

      // Get is on ground
      const isOnGround = stateVector.on_ground;

      // Get altitude
      var altitude = stateVector.baro_altitude;
      if (altitude === null)
        altitude = stateVector.geo_altitude;
      if (altitude === null)
        altitude = -1;

      // Get velocity in km/h
      const velocity = stateVector.velocity ? (stateVector.velocity * 3.6) : -1;

      // Get vertical rate
      const verticalRate = stateVector.vertical_rate ? stateVector.vertical_rate : 0;

      var properties: GeoJsonProperties = {
        ['iconName']: getIconName(isOnGround, verticalRate, altitude, trueTrack),
        ['rotation']: getRotation(trueTrack, verticalRate, altitude),
        ['color']: getColor(isSelected, isOnGround, altitude),
        ['isSelected']: isSelected,
        ['icao24']: stateVector.icao24,
        ['callsign']: callsign,
        ['altitude']: defaultNumberFormatter.format(altitude) + " m",
        ['velocity']: defaultNumberFormatter.format(velocity) + " km/h"
      }

      // Setup WGS84 coordinates
      var position: Position = [stateVector.longitude, stateVector.latitude];

      var point: Point = {
        type: 'Point',
        coordinates: position
      };

      var feature: Feature = {
        type: 'Feature',
        id: `${index}.${stateVector.icao24}`,
        geometry: point,
        properties: properties
      }

      featureCollection.features.push(feature);
    }

    return featureCollection;
  };

  const getIconName = (isOnGround: boolean, verticalRate: number, altitude: number, trueTrack: number): string => {

    if (isOnGround)
      return 'flight-icon';

    if (altitude <= 0)
      return 'flight-icon';

    if (verticalRate > 0 && altitude < 2000)
      if (trueTrack < 180)
        return 'flight-takeoff-icon';
      else
        return 'flight-takeoff-flipped-icon';

    if (verticalRate < 0 && altitude < 2000)
      if (trueTrack < 180)
        return 'flight-land-icon';
      else
        return 'flight-land-flipped-icon';

    return 'flight-icon';
  };

  const getRotation = (trueTrack: number, verticalRate: number, altitude: number) => {

    if (verticalRate > 0 && altitude < 2000)
      return 0.0;

    if (verticalRate < 0 && altitude < 2000)
      return 0.0;

    return trueTrack;
  };

  const getColor = (isSelected: boolean, isOnGround: boolean, altitude: number) => {

    if (isSelected)
      return theme.palette.secondary.main;

    if (isOnGround)
      return '#e3f2fd';

    if (altitude < 500)
      return '#f44336';

    if (altitude < 1500)
      return '#ff9800';

    if (altitude < 3000)
      return '#ffc107';

    if (altitude < 6000)
      return '#ffeb3b';

    if (altitude < 9000)
      return '#cddc39';

    if (altitude < 12000)
      return '#8bc34a';

    return '#4caf50';
  };

  const getText = (): string | Expression | StyleFunction => {

    var text: string | Expression | StyleFunction = '';
    const simpleText = ["get", "callsign"] as Expression
    const detailedText = ['format',
      ["get", "callsign"], { "font-scale": 1.0 },
      "\n", {},
      ["get", "altitude"], { "font-scale": 0.75, "text-color": '#fff' },
      "\n", {},
      ["get", "velocity"], { "font-scale": 0.75, "text-color": '#fff' }
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
      "text-halo-color": '#000',
      "text-halo-blur": 2
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