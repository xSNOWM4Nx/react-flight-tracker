import React, { useState, useContext, useRef, useEffect } from 'react';
import { ViewState } from 'react-map-gl';
import { SystemContext, ViewContainer } from '@daniel.neuweiler/react-lib-module';

import { ViewKeys } from './navigation';
import { IOpenSkyAPIService } from './../services';
import { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky';
import FlightMap from './../components/FlightMap';

interface ILocalProps {
}
type Props = ILocalProps;

const MapView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.MapView;

  // States
  const [stateVectors, setStateVectors] = useState<IStateVectorData>({ time: Date.now(), states: [] });
  const [trackedAircraft, setTrackedAircraft] = useState<IAircraftTrack | undefined>(undefined);

  // Contexts
  const systemContext = useContext(SystemContext)
  const openSkyAPIService = systemContext.getService<IOpenSkyAPIService>('OpenSkyAPIService');

  // Refs
  const stateVectorsSubscriptionRef = useRef<string>('');
  const aircraftTrackSubscriptionRef = useRef<string>('');

  // Effects
  useEffect(() => {

    // Mount
    if (openSkyAPIService) {

      // Get a register key for the subscription and save it as reference
      var registerKey = openSkyAPIService.onStateVectorsUpdated(contextName, handleStateVectorsUpdated);
      stateVectorsSubscriptionRef.current = registerKey;

      registerKey = openSkyAPIService.onAircraftTrackUpdated(contextName, handleAircraftTrackUpdated);
      aircraftTrackSubscriptionRef.current = registerKey;
    }

    // Unmount
    return () => {

      if (openSkyAPIService) {

        // Get the register key from the reference to unsubscribe
        var registerKey = stateVectorsSubscriptionRef.current;
        openSkyAPIService.offStateVectorsUpdated(registerKey);

        registerKey = aircraftTrackSubscriptionRef.current;
        openSkyAPIService.offAircraftTrackUpdated(registerKey);
      }
    }
  }, []);

  const handleStateVectorsUpdated = (data: IStateVectorData) => {

    setStateVectors(data);
  };

  const handleAircraftTrackUpdated = (data: IAircraftTrack) => {

    setTrackedAircraft(data);
  };

  const handleMapChange = (viewState: ViewState, geoBounds: IMapGeoBounds) => {

    if (openSkyAPIService)
      openSkyAPIService.geoBounds = geoBounds;
  };

  const handleTrackAircraft = (icao24: string) => {

    if (openSkyAPIService)
      openSkyAPIService.trackAircraft(icao24);

    setTrackedAircraft(undefined);
  };

  const handleReleaseTrack = (icao24: string) => {

    if (openSkyAPIService)
      openSkyAPIService.releaseTrack(icao24);

    setTrackedAircraft(undefined);
  };

  return (

    <ViewContainer
      isScrollLocked={true}>

      <FlightMap
        stateVectors={stateVectors}
        selectedAircraft={trackedAircraft}
        onMapChange={handleMapChange}
        onTrackAircraft={handleTrackAircraft}
        onReleaseTrack={handleReleaseTrack} />
    </ViewContainer>
  );
}

export default MapView;
