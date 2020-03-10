import React, { useState } from 'react';
import { Marker } from 'react-map-gl';
import { useTheme } from '@material-ui/core/styles';

import { IStateVectorData, IStateVector } from '../opensky';

import Typography from '@material-ui/core/Typography';
import FlightIcon from '@material-ui/icons/Flight';

interface ILocalProps {
  stateVectors: IStateVectorData;
  zoom: number;
  onSelect?: (stateVector: IStateVector) => void;
}
type Props = ILocalProps;

const AircraftMarkers: React.FC<Props> = (props) => {

  // External hooks
  const theme = useTheme();

  // States
  const [selectedStateVector, setSelectedStateVector] = useState<IStateVector | undefined>(undefined);

  // Helpers
  const showCallSign = props.zoom > 7;

  if (!props.stateVectors.states)
    return null;

  return (

    <React.Fragment>
      {props.stateVectors.states.map((data, index) => {

        if (!data.longitude)
          return undefined;

        if (!data.latitude)
          return undefined;

        const trueTrack = data.true_track ? data.true_track : 0.0;
        var markerFill = theme.palette.secondary.main;
        if (selectedStateVector && (selectedStateVector.icao24 === data.icao24))
          markerFill = theme.palette.success.main;

        return (
          <Marker
            key={index}
            longitude={data.longitude}
            latitude={data.latitude}>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center'
              }}
              onClick={(e) => {

                setSelectedStateVector(data);
                if (props.onSelect)
                  props.onSelect(data);
              }}>

              <span>
                <FlightIcon
                  style={{
                    fill: markerFill,
                    transform: `rotate(${trueTrack}deg)`
                  }} />
              </span>

              {showCallSign &&
                <React.Fragment>
                  <div style={{ minHeight: 4 }} />
                  <span
                    style={{
                      backgroundColor: '#000',
                      color: '#fff',
                      padding: 2
                    }}>

                    <Typography
                      variant="body2">
                      {data.callsign ? data.callsign : data.icao24}
                    </Typography>
                  </span>
                </React.Fragment>
              }
            </div>
          </Marker>
        )
      })}
    </React.Fragment>
  )
}

export default AircraftMarkers;