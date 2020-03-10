import React, { useState, useRef } from 'react';
import MapGL, { MapLoadEvent, PointerEvent, ViewportProps, ExtraState } from 'react-map-gl';
import { Feature } from 'geojson';
import { svgToImageAsync } from '@daniel.neuweiler/ts-lib-module';
import AircraftLayer from './AircraftLayer';
import { Constants } from './../mapbox';
import { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky';
import AircraftIcon from './../resources/airplanemode_active-24px.svg';

interface ILocalProps {
  stateVectors: IStateVectorData;
  selectedAircraft?: IAircraftTrack;
  onMapChange?: (viewState: ViewportProps, geoBounds: IMapGeoBounds) => void;
  onAircraftSelect?: (icao24: string) => void;
}
type Props = ILocalProps;

const FlightMap: React.FC<Props> = (props) => {

  // States
  const [viewportProps, setViewportProps] = useState<ViewportProps | undefined>(undefined);

  // Refs
  const mapRef = useRef<MapGL>(null);

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

    svgToImageAsync(AircraftIcon, 24, 24).then(image => {

      map.addImage('aircraft-icon', image, { sdf: true });
    });
  };

  const handleClick = (e: PointerEvent) => {

    if (e.features.length > 0) {

      const selectedFeature = e.features[0] as Feature;
      if (selectedFeature.properties) {

        const icao24 = selectedFeature.properties['icao24'] as string;

        if (props.onAircraftSelect)
          props.onAircraftSelect(icao24);
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

      <AircraftLayer
        stateVectors={props.stateVectors}
        zoom={viewportProps ? viewportProps.zoom : undefined}
        selectedAircraft={props.selectedAircraft} />

    </MapGL>
  );
}

export default FlightMap;