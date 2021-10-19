/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import React, { useContext, useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { jsx } from '@emotion/react';
import MapGL, { MapRef, FullscreenControl, NavigationControl, MapLoadEvent, MapEvent, ViewportProps, ExtraState } from 'react-map-gl';
import { Feature } from 'geojson';
import { svgToImageAsync } from '@daniel.neuweiler/ts-lib-module';
import { SystemContext } from '@daniel.neuweiler/react-lib-module';

import AircraftInfoOverlay from './AircraftInfoOverlay';
import DataOverlay from './DataOverlay';
import LogOverlay from './LogOverlay';
import AircraftLayer from './AircraftLayer';
import { Constants } from './../mapbox';
import { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky';
import { SettingKeys } from './../views/SettingsView';

import FlightIcon from './../resources/flight-24px.svg';
import FlightLandIcon from './../resources/flight_land-24px.svg';
import FlightLandFlippedIcon from './../resources/flight_land-24px_flippedx.svg';
import FlightTakeoffIcon from './../resources/flight_takeoff-24px.svg';
import FlightTakeoffFlippedIcon from './../resources/flight_takeoff-24px_flippedx.svg';

interface ILocalProps {
  stateVectors: IStateVectorData;
  selectedAircraft?: IAircraftTrack;
  onMapChange?: (viewState: ViewportProps, geoBounds: IMapGeoBounds) => void;
  onTrackAircraft?: (icao24: string) => void;
  onReleaseTrack?: (icao24: string) => void;
}
type Props = ILocalProps;

const FlightMap: React.FC<Props> = (props) => {

  // Contexts
  const systemContext = useContext(SystemContext);

  // States
  const [viewportProps, setViewportProps] = useState<ViewportProps | undefined>(undefined);

  // Refs
  const mapRef = useRef<MapRef | null>(null);

  // Effects
  useEffect(() => {

    // Mount

    // Unmount
    return () => {
    }
  }, []);
  useEffect(() => {

    const mapGeoBounds = getMapGeoBounds();
    if (props.onMapChange && viewportProps)
      props.onMapChange(viewportProps, mapGeoBounds);

  }, [mapRef.current]);

  const getMapGeoBounds = () => {

    var mapGeoBounds: IMapGeoBounds = {
      northernLatitude: 0.0,
      easternLongitude: 0.0,
      southernLatitude: 0.0,
      westernLongitude: 0.0
    }

    if (mapRef.current) {

      const mapGL = mapRef.current.getMap();
      const mapBounds = mapGL.getBounds();
      mapGeoBounds.northernLatitude = mapBounds.getNorthEast().lat;
      mapGeoBounds.easternLongitude = mapBounds.getNorthEast().lng;
      mapGeoBounds.southernLatitude = mapBounds.getSouthWest().lat;
      mapGeoBounds.westernLongitude = mapBounds.getSouthWest().lng;
    }

    return mapGeoBounds;
  };

  const handleLoad = (e: MapLoadEvent) => {

    const map = e.target;
    if (map == undefined)
      return;

    svgToImageAsync(FlightIcon, 24, 24).then(image => {

      map.addImage('flight-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightLandIcon, 24, 24).then(image => {

      map.addImage('flight-land-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightLandFlippedIcon, 24, 24).then(image => {

      map.addImage('flight-land-flipped-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightTakeoffIcon, 24, 24).then(image => {

      map.addImage('flight-takeoff-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightTakeoffFlippedIcon, 24, 24).then(image => {

      map.addImage('flight-takeoff-flipped-icon', image, { sdf: true });
    });
  };

  const handleClick = (e: MapEvent) => {

    if (e.features == undefined || e.features.length <= 0)
      return;

    const selectedFeature = e.features[0] as Feature;
    if (selectedFeature.properties) {

      const icao24 = selectedFeature.properties['icao24'] as string;
      if (icao24)
        if (props.onTrackAircraft)
          props.onTrackAircraft(icao24);
    }
  };

  const handleViewportChange = (viewState: ViewportProps, interactionState: ExtraState, oldViewState: ViewportProps) => {

    setViewportProps(viewState);

    const mapGeoBounds = getMapGeoBounds();
    if (props.onMapChange)
      props.onMapChange(viewState, mapGeoBounds);

  };

  // Helpers
  const settings = {
    dragPan: true,
    dragRotate: false,
    scrollZoom: true,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    doubleClickZoom: true,
    minZoom: 0,
    maxZoom: 20,
    minPitch: 0,
    maxPitch: 85
  }

  const showDataOverlayOnMap = systemContext.getSetting(SettingKeys.ShowDataOverlayOnMap);
  const showLogOverlayOnMap = systemContext.getSetting(SettingKeys.ShowLogOverlayOnMap);

  return (

    <MapGL
      ref={mapRef}
      zoom={Constants.DEFAULT_ZOOM}
      latitude={Constants.DEFAULT_LATITUDE}
      longitude={Constants.DEFAULT_LONGITUDE}
      {...viewportProps}
      {...settings}
      width={'100%'}
      height={'100%'}
      mapStyle="mapbox://styles/mapbox/dark-v10"
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      onLoad={handleLoad}
      onClick={handleClick}
      onViewportChange={handleViewportChange}>

      <FullscreenControl
        css={(theme) => ({
          position: 'absolute',
          bottom: 144,
          right: 8,
          backgroundColor: theme.palette.grey[500]
        })} />
      <NavigationControl
        css={(theme) => ({
          position: 'absolute',
          bottom: 48,
          right: 8,
          backgroundColor: theme.palette.grey[500]
        })} />

      {showDataOverlayOnMap &&
        <Box
          sx={{
            position: 'absolute',
            bottom: 48,
            right: 50
          }}>
          <DataOverlay
            stateVectors={props.stateVectors} />
        </Box>
      }

      {showLogOverlayOnMap &&
        <Box
          sx={{
            position: 'absolute',
            bottom: 186,
            right: 50
          }}>
          <LogOverlay />
        </Box>
      }

      {props.selectedAircraft &&
        <Box
          sx={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            padding: '10px'
          }}>

          <AircraftInfoOverlay
            selectedAircraft={props.selectedAircraft}
            onRelease={props.onReleaseTrack} />
        </Box>
      }

      <AircraftLayer
        stateVectors={props.stateVectors}
        zoom={viewportProps ? viewportProps.zoom : undefined}
        selectedAircraft={props.selectedAircraft} />

    </MapGL>
  );
}

export default FlightMap;