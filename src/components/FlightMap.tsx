import React, { useState, useRef } from 'react';
import MapGL, { Source, Layer, ViewportProps, ExtraState } from 'react-map-gl';
import AircraftMarkers from './AircraftMarkers';
import { Constants } from './../mapbox';
import { IStateVectorData, IStateVector, IMapGeoBounds } from './../opensky';

interface ILocalProps {
  stateVectors: IStateVectorData;
  onMapChange?: (viewState: ViewportProps, geoBounds: IMapGeoBounds) => void;
  onAircraftSelect?: (stateVector: IStateVector) => void;
}
type Props = ILocalProps;

const FlightMap: React.FC<Props> = (props) => {

  // States
  const [viewportProps, setViewportProps] = useState<ViewportProps | undefined>(undefined);
  const [isInteracting, setInteraction] = useState(false);

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

  const handleInteractionChange = (interactionState: ExtraState) => {

    if (interactionState.isPanning || interactionState.isZooming) {

      setInteraction(true);
      return;
    }

    setInteraction(false);

    if (!viewportProps)
      return;

    const mapGeoBounds = getMapGeoBounds();
    if (props.onMapChange)
      props.onMapChange(viewportProps, mapGeoBounds);
  };

  const handleViewportChange = (viewState: ViewportProps, interactionState: ExtraState, oldViewState: ViewportProps) => {
    setViewportProps(viewState);
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
      onInteractionStateChange={handleInteractionChange}
      onViewportChange={handleViewportChange}>

      {/* <Source
        type="geojson"
        data={data}>
        <Layer {...dataLayer} />
      </Source> */}

      {!isInteracting &&
        <AircraftMarkers
          stateVectors={props.stateVectors}
          zoom={viewportProps ? viewportProps.zoom : 1}
          onSelect={props.onAircraftSelect}>

        </AircraftMarkers>
      }
    </MapGL>
  );
}

export default FlightMap;