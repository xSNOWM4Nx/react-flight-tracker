import React, { useContext, useRef, useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import ReactMap, { FullscreenControl, NavigationControl } from 'react-map-gl/mapbox';
import { Map } from 'mapbox-gl';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { svgToImageAsync } from '../helpers/imageFunctions.js';
import { Constants } from './../mapbox/constants.js';
import AircraftInfoOverlay from './AircraftInfoOverlay.js';
import DataOverlay from './DataOverlay.js';
import AircraftLayer, { aircraftLayerId } from './AircraftLayer.js';

// Types
import type { Feature } from 'geojson';
import type { MapRef, ViewState, ViewStateChangeEvent, MapEvent, MapMouseEvent, MapStyleDataEvent } from 'react-map-gl/mapbox';
import type { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky/types.js';

// Icons
import FlightIcon from './../resources/flight-24px.svg';
import FlightLandIcon from './../resources/flight_land-24px.svg';
import FlightLandFlippedIcon from './../resources/flight_land-24px_flippedx.svg';
import FlightTakeoffIcon from './../resources/flight_takeoff-24px.svg';
import FlightTakeoffFlippedIcon from './../resources/flight_takeoff-24px_flippedx.svg';

interface ILocalProps {
  stateVectors: IStateVectorData;
  selectedAircraft?: IAircraftTrack;
  onMapChange?: (viewState: ViewState, geoBounds: IMapGeoBounds) => void;
  onTrackAircraft?: (icao24: string) => void;
  onReleaseTrack?: (icao24: string) => void;
}
type Props = ILocalProps;

const FlightMap: React.FC<Props> = (props) => {

  // External hooks
  const styleTheme = useTheme();

  // Contexts
  const appContext = useContext(AppContext);

  const getDefaultViewState = () => {

    const defaultViewState: ViewState = {
      latitude: Constants.DEFAULT_LATITUDE,
      longitude: Constants.DEFAULT_LONGITUDE,
      zoom: Constants.DEFAULT_ZOOM,
      bearing: 0,
      pitch: 0,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    };

    return defaultViewState;
  };

  // States
  const [viewState, setViewState] = useState<ViewState>(getDefaultViewState());

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
    if (props.onMapChange)
      props.onMapChange(viewState, mapGeoBounds);

  }, [mapRef.current]);

  const getMapGeoBounds = () => {

    var mapGeoBounds: IMapGeoBounds = {
      northernLatitude: 0.0,
      easternLongitude: 0.0,
      southernLatitude: 0.0,
      westernLongitude: 0.0
    }

    if (mapRef.current) {

      const map = mapRef.current.getMap();
      const mapBounds = map.getBounds();
      if (!mapBounds)
        return mapGeoBounds;

      mapGeoBounds.northernLatitude = mapBounds.getNorthEast().lat;
      mapGeoBounds.easternLongitude = mapBounds.getNorthEast().lng;
      mapGeoBounds.southernLatitude = mapBounds.getSouthWest().lat;
      mapGeoBounds.westernLongitude = mapBounds.getSouthWest().lng;
    }

    return mapGeoBounds;
  };

  const addMapSources = (map: Map) => {

    svgToImageAsync(FlightIcon, 24, 24).then(image => {

      if (!map.hasImage('flight-icon'))
        map.addImage('flight-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightLandIcon, 24, 24).then(image => {

      if (!map.hasImage('flight-land-icon'))
        map.addImage('flight-land-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightLandFlippedIcon, 24, 24).then(image => {

      if (!map.hasImage('flight-land-flipped-icon'))
        map.addImage('flight-land-flipped-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightTakeoffIcon, 24, 24).then(image => {

      if (!map.hasImage('flight-takeoff-icon'))
        map.addImage('flight-takeoff-icon', image, { sdf: true });
    });
    svgToImageAsync(FlightTakeoffFlippedIcon, 24, 24).then(image => {

      if (!map.hasImage('flight-takeoff-flipped-icon'))
        map.addImage('flight-takeoff-flipped-icon', image, { sdf: true });
    });
  };

  const handleLoad = (e: MapEvent) => {

    const map = e.target;
    if (map == undefined)
      return;

    addMapSources(map);
  };

  const handleStyleData = (e: MapStyleDataEvent) => {

    // const map = e.dataType;
    // if (map == undefined)
    //   return;

    // addMapSources(map);
  };

  const handleClick = (e: MapMouseEvent) => {

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

  const handleMove = (e: ViewStateChangeEvent) => {

    setViewState(e.viewState);

    const mapGeoBounds = getMapGeoBounds();
    if (props.onMapChange)
      props.onMapChange(viewState, mapGeoBounds);
  };

  // Helpers
  const defaultMapSettings = {
    dragPan: true,
    dragRotate: false,
    scrollZoom: true,
    keyboard: true,
    doubleClickZoom: true,
    minZoom: 0,
    maxZoom: 20,
    minPitch: 0,
    maxPitch: 85
  }

  // Get settings
  const showDataOverlayOnMap = appContext.pullSetting(SettingKeys.ShowDataOverlayOnMap);

  return (

    <ReactMap
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%'
      }}
      {...viewState}
      {...defaultMapSettings}
      interactiveLayerIds={[
        aircraftLayerId
      ]}
      mapStyle={styleTheme.map.style}
      mapboxAccessToken={import.meta.env.VITE_REACT_MAPBOX_TOKEN}
      onLoad={handleLoad}
      onClick={handleClick}
      onMove={handleMove}
      onStyleData={handleStyleData}>

      <FullscreenControl
        position='bottom-right' />

      <NavigationControl
        position='bottom-right' />

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
        viewState={viewState}
        stateVectors={props.stateVectors}
        zoom={viewState.zoom}
        selectedAircraft={props.selectedAircraft} />

    </ReactMap>
  );
}

export default FlightMap;