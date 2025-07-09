import React, { useState, useContext, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { AppContext } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { NavigationTypeEnumeration } from '../navigation/navigationTypes';
import { ViewKeys } from './viewKeys';
import FlightMap from './../components/FlightMap';

// Icons
import FlightIcon from '@mui/icons-material/Flight';

// Types
import type { ViewState } from 'react-map-gl/mapbox';
import type { INavigationElement, INavigationElementProps } from '../navigation/navigationTypes.js';
import type { IOpenSkyAPIService } from './../services/openSkyAPIService.js';
import type { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky/types.js';

export const mapViewNavigationData: INavigationElement = {
  key: ViewKeys.MapView,
  name: 'Map',
  importPath: 'views/MapView',
  type: NavigationTypeEnumeration.View,
  Icon: FlightIcon
};

interface ILocalProps {
}
type Props = ILocalProps & INavigationElementProps;

const MapView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.MapView;

  // States
  const [stateVectors, setStateVectors] = useState<IStateVectorData>({ time: Date.now(), states: [] });
  const [trackedAircraft, setTrackedAircraft] = useState<IAircraftTrack | undefined>(undefined);

  // Contexts
  const appContext = useContext(AppContext)
  const openSkyAPIService = appContext.getService<IOpenSkyAPIService>(ServiceKeys.OpenSkyAPIService);

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

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

      <FlightMap
        stateVectors={stateVectors}
        selectedAircraft={trackedAircraft}
        onMapChange={handleMapChange}
        onTrackAircraft={handleTrackAircraft}
        onReleaseTrack={handleReleaseTrack} />
    </Box>
  );
}

export default MapView;
