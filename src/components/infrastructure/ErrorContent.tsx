import React from 'react';
import { Box } from '@mui/material';

interface ILocalProps {
  sourceName: string;
  errorMessage: string;
  stackInfo?: string;
}
type Props = ILocalProps;

export const ErrorContent: React.FC<Props> = (props) => {

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignContent: "center",
        justifyItems: "center",
        justifyContent: "center"
      }}>

      <Box
        component='span'
        sx={{
          fontSize: 100
        }}>
        🤔
      </Box>
      <Box
        sx={{
          fontSize: 24
        }}>
        {`Oops, something went wrong @'${props.sourceName}'`}
      </Box>
      <Box
        sx={{
          fontSize: 16,
          maxWidth: 1024
        }}>
        {props.errorMessage}
      </Box>
      <Box
        sx={{
          fontSize: 16,
          maxWidth: 1024
        }}>
        {props.stackInfo}
      </Box>
    </Box>
  );
}