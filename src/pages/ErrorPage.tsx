import React from 'react';
import { Box } from '@mui/material';
import { ErrorContent } from '../components/infrastructure/ErrorContent.js';

interface ILocalProps {
  sourceName?: string;
  errorMessage?: string;
}
type Props = ILocalProps;

const ErrorPage: React.FC<Props> = (props) => {

  // Helpers
  const sourceName = (props.sourceName !== undefined) ? props.sourceName : 'Unknown';
  const errorMessage = (props.errorMessage !== undefined) ? props.errorMessage : 'Unknown';

  return (

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignContent: 'center',
        justifyItems: 'center',
        justifyContent: 'center'
      }}>

      <ErrorContent
        sourceName={sourceName}
        errorMessage={errorMessage} />

    </Box>
  );
}

export default ErrorPage;