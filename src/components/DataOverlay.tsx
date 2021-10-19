import React from 'react';
import { Box, Typography } from '@mui/material';
import { IStateVectorData } from '../opensky';

interface ILocalProps {
  stateVectors: IStateVectorData;
}
type Props = ILocalProps;

const DataOverlay: React.FC<Props> = (props) => {

  return (
    <Box
      sx={{
        position: 'relative',
        width: 160,
        height: 116,
        backgroundColor: (theme) => theme.palette.grey[500],
        color: (theme) => theme.palette.grey[900],
        borderRadius: 4,
        opacity: 0.9,
        padding: (theme) => theme.spacing(1)
      }}>

      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          alignContent: 'flex-start',
        }}>
        <Typography
          variant='body1'>
          {'Visible flights'}
        </Typography>
        <Typography
          variant='h6'>
          {props.stateVectors.states.length.toString()}
        </Typography>
      </Box>

    </Box>
  );
}

export default DataOverlay;