import React from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { IStateVectorData, IStateVector } from '../opensky';

import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import FlightIcon from '@material-ui/icons/Flight';

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
  aircraftData?: IStateVector;
}
type Props = ILocalProps;

const AircraftData: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();
  const theme = useTheme();

  if (!props.aircraftData)
    return (
      <Card
        className={classes.cardRoot}>

      </Card>
    );

  const renderHeader = (data: IStateVector) => {

    const trueTrack = data.true_track ? data.true_track : 0.0;

    return (

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center'
        }}>

        <span>
          <FlightIcon
            style={{
              height: 40,
              width: 40,
              transform: `rotate(${trueTrack}deg)`
            }} />
        </span>

        <Typography
          variant="h4">
          {data.callsign ? data.callsign : data.icao24}
        </Typography>

      </div>
    );
  };

  const renderFlightData = (data: IStateVector) => {

    var options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    var lastPositionUpdate = '?';
    if (data.time_position !== null) {

      var date = new Date(data.time_position * 1000);
      lastPositionUpdate = new Intl.DateTimeFormat('de-CH', options).format(date)
    }

    var lastUpdate = '?';
    if (data.last_contact !== null) {

      var date = new Date(data.last_contact * 1000);
      lastUpdate = new Intl.DateTimeFormat('de-CH', options).format(date)
    }

    return (

      <React.Fragment>

        <Typography
          variant="body2">
          {'ICAO 24-bit address'}
        </Typography>
        <Typography
          variant="h6">
          {data.icao24}
        </Typography>

        <div style={{ minHeight: 8 }} />

        <Typography
          variant="body2">
          {'Callsign'}
        </Typography>
        <Typography
          variant="h6">
          {data.callsign ? data.callsign : '?'}
        </Typography>

        <div style={{ minHeight: 8 }} />

        <Typography
          variant="body2">
          {'Country name'}
        </Typography>
        <Typography
          variant="h6">
          {data.origin_country}
        </Typography>

        <div style={{ minHeight: 8 }} />

        <Typography
          variant="body2">
          {'Last position update'}
        </Typography>
        <Typography
          variant="h6">
          {lastPositionUpdate}
        </Typography>

        <div style={{ minHeight: 8 }} />

        <Typography
          variant="body2">
          {'Last update'}
        </Typography>
        <Typography
          variant="h6">
          {lastUpdate}
        </Typography>

        <div style={{ minHeight: 8 }} />

        <Typography
          variant="body2">
          {'Longitude'}
        </Typography>
        <Typography
          variant="h6">
          {data.latitude ? data.latitude : '?'}
        </Typography>

      </React.Fragment>
    );
  };

  return (

    <Card
      className={classes.cardRoot}>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: theme.spacing(1)
        }}>

        {renderHeader(props.aircraftData)}
        {renderFlightData(props.aircraftData)}
      </div>
    </Card>

  );
}

export default AircraftData;