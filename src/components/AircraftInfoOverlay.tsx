/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useEffect } from 'react';
import { Indicator1 } from '@daniel.neuweiler/react-lib-module';

import { Box, Typography, IconButton } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { jsx } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';

import { IAircraftTrack, IStateVector } from '../opensky';
import { getFormattedValue, getIcon, getRotation, getStatusText } from '../helpers';

interface ILocalProps {
  selectedAircraft?: IAircraftTrack;
  onRelease?: (icao24: string) => void;
}
type Props = ILocalProps;

const AircraftInfoOverlay: React.FC<Props> = (props) => {

  // External hooks
  const theme = useTheme();

  // States
  const [lastPositionPastSeconds, setLastPositionPastSeconds] = useState(0);

  // Refs
  const updateIntverlIDRef = useRef(0);
  const lastPositionPastSecondsRef = useRef(lastPositionPastSeconds);
  lastPositionPastSecondsRef.current = lastPositionPastSeconds;

  // Effects
  useEffect(() => {

    // Mount

    // Unmount
    return () => {

      clearInterval(updateIntverlIDRef.current);
    }
  }, []);
  useEffect(() => {

    if (!props.selectedAircraft || !props.selectedAircraft.stateVector) {

      clearInterval(updateIntverlIDRef.current);
      return;
    }

    clearInterval(updateIntverlIDRef.current);

    const lastPositionSeconds = props.selectedAircraft.stateVector.time_position ? props.selectedAircraft.stateVector.time_position : Math.floor(Date.now() / 1000);
    setLastPositionPastSeconds(Math.floor(Date.now() / 1000) - lastPositionSeconds);

    updateIntverlIDRef.current = window.setInterval(handleUpdate, 1000);

  }, [props.selectedAircraft?.stateVector]);

  const handleUpdate = () => {

    setLastPositionPastSeconds(lastPositionPastSecondsRef.current + 1);
  };

  const renderHeader = () => {

    if (!props.selectedAircraft)
      return undefined;

    if (!props.selectedAircraft.stateVector)
      return undefined;

    const stateVector = props.selectedAircraft.stateVector;

    // Get altitude
    var altitude = stateVector.geo_altitude;
    if ((altitude === null) || (altitude < 0))
      altitude = stateVector.baro_altitude;
    if ((altitude === null) || (altitude < 0))
      altitude = 0;

    // Get vertical rate
    const verticalRate = stateVector.vertical_rate ? stateVector.vertical_rate : 0;

    // Get true track
    const trueTrack = stateVector.true_track ? stateVector.true_track : 0.0;

    const FlightIcon = getIcon(stateVector.on_ground, verticalRate, altitude);

    return (

      <React.Fragment>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center'
          }}>

          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>

            <FlightIcon
              css={(theme) => ({
                fill: theme.palette.primary.contrastText,
                width: 32,
                height: 32,
                transform: `rotate(${getRotation(trueTrack, verticalRate, altitude!)}deg)`
              })} />
          </Box>

          <Box
            sx={{
              flex: 'auto',
              marginLeft: 1,
              marginRight: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              alignContent: 'flex-start'
            }}>
            <Typography
              variant='h6'>
              {stateVector.callsign ? stateVector.callsign : '?'}
            </Typography>
            <Typography
              variant='body1'>
              {stateVector.origin_country}
            </Typography>
          </Box>

          <IconButton
            aria-label="close"
            onClick={() => {

              if (!props.selectedAircraft)
                return;

              if (!props.selectedAircraft.stateVector)
                return undefined;

              if (props.onRelease)
                props.onRelease(props.selectedAircraft.stateVector.icao24)
            }}>
            <CloseIcon color='error' />
          </IconButton>

        </Box>

        <Box
          sx={{
            width: '100%',
            height: 2,
            marginTop: 1,
            marginBottom: 2,
            backgroundColor: (theme) => theme.palette.primary.main
          }} />

      </React.Fragment>
    );
  };

  const renderFlightData = () => {

    if (!props.selectedAircraft)
      return undefined;

    if (!props.selectedAircraft.stateVector)
      return undefined;

    const stateVector = props.selectedAircraft.stateVector;

    var options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    var lastPositionTime = '?';
    if (stateVector.time_position !== null) {

      var date = new Date(stateVector.time_position * 1000);
      lastPositionTime = new Intl.DateTimeFormat('de-CH', options).format(date)
    }

    var lastContactTime = '?';
    if (stateVector.last_contact !== null) {

      var lastContactDate = new Date(stateVector.last_contact * 1000);
      lastContactTime = new Intl.DateTimeFormat('de-CH', options).format(lastContactDate)
    }

    // Get altitude
    const barometricAltitude = stateVector.baro_altitude ? stateVector.baro_altitude : 0;
    const geometricAltitude = stateVector.geo_altitude ? stateVector.geo_altitude : 0;
    var altitude = stateVector.geo_altitude;
    if ((altitude === null) || (altitude < 0))
      altitude = stateVector.baro_altitude;
    if ((altitude === null) || (altitude < 0))
      altitude = 0;

    // Get velocity
    const velocity = stateVector.velocity ? stateVector.velocity : -1;

    // Get vertical rate
    const verticalRate = stateVector.vertical_rate ? stateVector.vertical_rate : 0.0;

    // Get true track
    const trueTrack = stateVector.true_track ? stateVector.true_track : 0.0;

    var textContainerStyle: SxProps<Theme> = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignContent: 'flex-start'
    };

    var spaceStyle: SxProps<Theme> = {
      height: 8,
      minHeight: 8
    };

    return (

      <React.Fragment>

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Last contact'}
          </Typography>
          <Typography
            variant='body1'>
            {`${lastContactTime} [${lastPositionPastSeconds.toString()}s]`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Last position update'}
          </Typography>
          <Typography
            variant='body1'>
            {`${lastPositionTime} [${lastPositionPastSeconds.toString()}s]`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Barometric altitude'}
          </Typography>
          <Typography
            variant='body1'>
            {`${getFormattedValue(barometricAltitude, 1)} m [${getFormattedValue(barometricAltitude * 3.28084, 1)} ft.]`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Geometric altitude'}
          </Typography>
          <Typography
            variant='body1'>
            {`${getFormattedValue(geometricAltitude, 1)} m [${getFormattedValue(geometricAltitude * 3.28084, 1)} ft.]`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Velocity'}
          </Typography>
          <Typography
            variant='body1'>
            {`${getFormattedValue(velocity * 3.6, 1)} km/h [${getFormattedValue(velocity, 1)} m/s]`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Longitude / Latitude'}
          </Typography>
          <Typography
            variant='body1'>
            {`${getFormattedValue(stateVector.longitude ? stateVector.longitude : -1, 3)} ° / ${getFormattedValue(stateVector.latitude ? stateVector.latitude : -1, 3)} °`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Rotation'}
          </Typography>
          <Typography
            variant='body1'>
            {`${getFormattedValue(trueTrack, 1)} °`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Vertical rate'}
          </Typography>
          <Typography
            variant='body1'>
            {`${getFormattedValue(verticalRate, 1)} m/s`}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Status'}
          </Typography>
          <Typography
            variant='body1'>
            {getStatusText(stateVector.on_ground, verticalRate, altitude)}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'ICAO24'}
          </Typography>
          <Typography
            variant='body1'>
            {stateVector.icao24}
          </Typography>
        </Box>

        <Box sx={spaceStyle} />

        <Box
          sx={textContainerStyle}>
          <Typography
            variant='body2'>
            {'Transpondercode [Squawk]'}
          </Typography>
          <Typography
            variant='body1'>
            {stateVector.squawk ? stateVector.squawk : -1}
          </Typography>
        </Box>

      </React.Fragment>
    );
  };

  if (!props.selectedAircraft)
    return (

      <Box
        sx={{
          position: 'relative',
          minWidth: 268,
          minHeight: 84,
          height: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 5,
          opacity: 0.9,
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          justifyItems: 'center'
        }}>

        <Indicator1
          color={theme.palette.primary.main} />
      </Box>
    );

  return (

    <Box
      sx={{
        position: 'relative',
        minWidth: 268,
        height: 'auto',
        width: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 5,
        opacity: 0.9,
        padding: theme.spacing(1)
      }}>

      {renderHeader()}
      {renderFlightData()}
    </Box>
  );
}

export default AircraftInfoOverlay;