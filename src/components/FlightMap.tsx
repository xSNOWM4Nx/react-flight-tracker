import React, { useContext, useState, useRef, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MapGL, { FullscreenControl, NavigationControl, MapLoadEvent, PointerEvent, ViewportProps, ExtraState } from 'react-map-gl';
import { Feature } from 'geojson';
import { svgToImageAsync } from '@daniel.neuweiler/ts-lib-module';
import { GlobalContext } from '@daniel.neuweiler/react-lib-module';

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fullScreenControlContainer: {
      position: 'absolute',
      bottom: 140,
      right: 0,
      padding: '10px'
    },
    navigationControlContainer: {
      position: 'absolute',
      bottom: 38,
      right: 0,
      padding: '10px'
    },
    dataOverlayContainer: {
      position: 'absolute',
      bottom: 48,
      right: 50,
    },
    logOverlayContainer: {
      position: 'absolute',
      bottom: 186,
      right: 50,
    },
    mapControl: {
      backgroundColor: theme.palette.grey[500]
    },
    aircraftOverlayContainer: {
      position: 'absolute',
      bottom: 38,
      left: 0,
      padding: '10px',
    }
  }),
);

interface ILocalProps {
  stateVectors: IStateVectorData;
  selectedAircraft?: IAircraftTrack;
  onMapChange?: (viewState: ViewportProps, geoBounds: IMapGeoBounds) => void;
  onTrackAircraft?: (icao24: string) => void;
  onReleaseTrack?: (icao24: string) => void;
}
type Props = ILocalProps;

const FlightMap: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();

  // Contexts
  const globalContext = useContext(GlobalContext);

  // States
  const [viewportProps, setViewportProps] = useState<ViewportProps | undefined>(undefined);

  // Refs
  const mapRef = useRef<MapGL>(null);

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

    if (!mapRef.current)
      return;

    var map = mapRef.current.getMap();

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

  const handleClick = (e: PointerEvent) => {

    if (e.features.length > 0) {

      const selectedFeature = e.features[0] as Feature;
      if (selectedFeature.properties) {

        const icao24 = selectedFeature.properties['icao24'] as string;
        if (icao24)
          if (props.onTrackAircraft)
            props.onTrackAircraft(icao24);
      }
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

  const showDataOverlayOnMap = globalContext.getSetting(SettingKeys.ShowDataOverlayOnMap);
  const showLogOverlayOnMap = globalContext.getSetting(SettingKeys.ShowLogOverlayOnMap);

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

      <div className={classes.fullScreenControlContainer}>
        <FullscreenControl className={classes.mapControl} />
      </div>
      <div className={classes.navigationControlContainer}>
        <NavigationControl className={classes.mapControl} />
      </div>

      {showDataOverlayOnMap &&
        <div className={classes.dataOverlayContainer}>
          <DataOverlay
            stateVectors={props.stateVectors} />
        </div>
      }

      {showLogOverlayOnMap &&
        <div className={classes.logOverlayContainer}>
          <LogOverlay />
        </div>
      }

      {props.selectedAircraft &&
        <div className={classes.aircraftOverlayContainer}>
          <AircraftInfoOverlay
            selectedAircraft={props.selectedAircraft}
            onRelease={props.onReleaseTrack} />
        </div>
      }

      <AircraftLayer
        stateVectors={props.stateVectors}
        zoom={viewportProps ? viewportProps.zoom : undefined}
        selectedAircraft={props.selectedAircraft} />

    </MapGL>
  );
}

export default FlightMap;