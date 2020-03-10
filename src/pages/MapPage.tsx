import React, { useState, useRef, useContext, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ViewportProps } from 'react-map-gl';
import { ServiceContext } from '@daniel.neuweiler/react-lib-module';

import { IOpenSkyAPIService } from './../services';
import { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky';
import FlightMap from './../components/FlightMap';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardRoot: {
      backgroundColor: theme.palette.primary.main,
      height: '100%',
      borderRadius: 0
    }
  }),
);

interface ILocalProps {
}
type Props = ILocalProps;

const MapPage: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();

  // States
  const [stateVectors, setStateVectors] = useState<IStateVectorData>({ time: Date.now(), states: [] });
  const [trackedAircraft, setTrackedAircraft] = useState<IAircraftTrack | undefined>(undefined);

  // Contexts
  const serviceContext = useContext(ServiceContext)
  const openSkyAPIService = serviceContext.getService<IOpenSkyAPIService>('OpenSkyAPIService');

  // Effects
  useEffect(() => {

    // Mount
    if (openSkyAPIService) {

      openSkyAPIService.onStateVectorsUpdated('MapPage', handleStateVectorsUpdated);
      openSkyAPIService.onAircraftTrackUpdated('MapPage', handleAircraftTrackUpdated);
    }

    // Unmount
    return () => {

      if (openSkyAPIService) {

        openSkyAPIService.offStateVectorsUpdated('MapPage', handleStateVectorsUpdated);
        openSkyAPIService.offAircraftTrackUpdated('MapPage', handleAircraftTrackUpdated);
      }
    }
  }, []);

  const handleStateVectorsUpdated = (data: IStateVectorData) => {

    setStateVectors(data);
  };

  const handleAircraftTrackUpdated = (data: IAircraftTrack) => {

    setTrackedAircraft(data);
  };

  const handleMapChange = (viewState: ViewportProps, geoBounds: IMapGeoBounds) => {

    if (openSkyAPIService)
      openSkyAPIService.geoBounds = geoBounds;
  };

  const handleAircraftSelect = (icao24: string) => {

    if (openSkyAPIService)
      openSkyAPIService.trackAircraft(icao24);
  };

  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        margin: 8
      }}>

      <FlightMap
        stateVectors={stateVectors}
        selectedAircraft={trackedAircraft}
        onMapChange={handleMapChange}
        onAircraftSelect={handleAircraftSelect} />

    </div>
  )
};

export default MapPage;
