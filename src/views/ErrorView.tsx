import React from 'react';
import { Box } from '@mui/material';
import { NavigationTypeEnumeration } from '../navigation/navigationTypes';
import { ViewKeys } from './viewKeys';

// Types
import type { INavigationElement, INavigationElementProps } from '../navigation/navigationTypes';

// Icons
import ErrorIcon from '@mui/icons-material/Error';

export const errorViewNavigationData: INavigationElement = {
  key: ViewKeys.ErrorView,
  name: 'Error',
  importPath: 'views/ErrorView',
  type: NavigationTypeEnumeration.View,
  Icon: ErrorIcon
};

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
