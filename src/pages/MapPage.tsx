import React, { useState, useRef, useContext, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ViewportProps } from 'react-map-gl';
import { ServiceKeys, IRESTService } from '@daniel.neuweiler/ts-lib-module';
import { ServiceContext } from '@daniel.neuweiler/react-lib-module';

import { IDataTracker, DataTracker, IStateVectorData, IStateVector, IMapGeoBounds } from './../opensky';
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
  const [selectedStateVector, setSelectedStateVector] = useState<IStateVector | undefined>(undefined);

  // Contexts
  const serviceContext = useContext(ServiceContext)
  const restService = serviceContext.injectService<IRESTService>(ServiceKeys.RESTService);

  // Refs
  const dataTrackerRef = useRef<IDataTracker>(new DataTracker(restService!));
  const selectedStateVectorRef = useRef<IStateVector | undefined>(selectedStateVector);
  selectedStateVectorRef.current = selectedStateVector;

  // Effects
  useEffect(() => {

    // Mount
    dataTrackerRef.current.setOpenSkyCredentials(process.env.REACT_APP_OSKY_USERNAME, process.env.REACT_APP_OSKY_PASSWORD);
    dataTrackerRef.current.onStateVectorsUpdated('', handleStateVectorsUpdated);
    dataTrackerRef.current.start();

    // Unmount
    return () => {

      dataTrackerRef.current.stop();
      dataTrackerRef.current.offStateVectorsUpdated('', handleStateVectorsUpdated);
    }
  }, []);

  const handleStateVectorsUpdated = (data: IStateVectorData) => {

    setStateVectors(data);

    if (selectedStateVectorRef.current) {

      var newSelectedStateVector = data.states.find((stateVector, index) => stateVector.icao24 === selectedStateVectorRef.current!.icao24);
      if (newSelectedStateVector) {

        setSelectedStateVector(newSelectedStateVector);
      }
    }
  };

  const handleMapChange = (viewState: ViewportProps, geoBounds: IMapGeoBounds) => {

    dataTrackerRef.current.geoBounds = geoBounds;
  };

  const handleAircraftSelect = (stateVector: IStateVector) => {

    dataTrackerRef.current.trackAircraft(stateVector.icao24);
    setSelectedStateVector(stateVector);
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
        onMapChange={handleMapChange}
        onAircraftSelect={handleAircraftSelect} />

    </div>
  )
};

export default MapPage;
