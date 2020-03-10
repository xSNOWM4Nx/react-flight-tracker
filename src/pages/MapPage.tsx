import React, { useState, useRef, useContext, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ViewportProps } from 'react-map-gl';
import { ServiceKeys, IRESTService } from '@mymodules/ts-lib-module';
import { ServiceContext } from '@mymodules/react-lib-module';

import { Constants } from './../mapbox';
import { IDataTracker, DataTracker, IStateVectorData, IStateVector, IMapGeoBounds } from './../opensky';
import FlightMap from './../components/FlightMap';
import AircraftData from '../components/AircraftData';


import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import RotateLeftIcon from '@material-ui/icons/RotateLeft';

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
  const [viewportProps, setViewportProps] = useState<ViewportProps | undefined>(undefined);
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

  const renderMapFooter = () => {

    return (

      <Card
        className={classes.cardRoot}>

        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            textAlign: 'center'
          }}>

          <div style={{ minWidth: 8 }} />

          <IconButton
            aria-label="reset"
            onClick={(e) => {

              if (!viewportProps)
                return;

              var newViewportProps = { ...viewportProps };
              newViewportProps.bearing = 0;
              newViewportProps.pitch = 0;
              newViewportProps.zoom = Constants.DEFAULT_ZOOM;
              newViewportProps.latitude = Constants.DEFAULT_LATITUDE;
              newViewportProps.longitude = Constants.DEFAULT_LONGITUDE;

              setViewportProps(newViewportProps);
            }}>

            <RotateLeftIcon fontSize='large' />
          </IconButton>

          <Typography
            variant="h5">
            {stateVectors ? stateVectors.states.length : 0}
          </Typography>

        </div>
      </Card>
    );
  };

  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        margin: 8,
        display: 'flex',
        flexDirection: 'row'
      }}>

      <div
        style={{
          flex: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>

        <div
          style={{
            overflow: 'hidden',
            flex: 'auto',
          }}>
          <FlightMap
            stateVectors={stateVectors}
            onMapChange={handleMapChange}
            onAircraftSelect={handleAircraftSelect} />
        </div>

        <div style={{ minHeight: 16 }} />

        <div
          style={{
            height: 64,
            minHeight: 64
          }}>
          {renderMapFooter()}
        </div>

      </div>

      <div style={{ minWidth: 16 }} />

      <div
        style={{
          width: 384
        }}>
        <AircraftData
          aircraftData={selectedStateVector} />
      </div>

    </div>
  )
};

export default MapPage;
