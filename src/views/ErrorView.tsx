import React from 'react';
import { Box } from '@mui/material';
import { ViewKeys } from './viewKeys';

// Types
import type { INavigationElementProps } from '../navigation/navigationTypes';

interface ILocalProps {
}
type Props = ILocalProps & INavigationElementProps;

const ErrorView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.ErrorView

  return (

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

    </Box>
  );
}

export default ErrorView;
