import React, { useContext, useEffect } from 'react';
import { ServiceKeys, INavigationService, INavigationRequest, NavigationTypeEnumeration } from '@daniel.neuweiler/ts-lib-module';
import { ServiceContext } from '@daniel.neuweiler/react-lib-module';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';

import RouterPage from './RouterPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh',
      width: '100vw',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.primary.main
    },
    pageContainer: {
      overflow: 'hidden',
      flex: 'auto',
      margin: theme.spacing(1),
      backgroundColor: "#303030",
      color: 'rgba(255, 255, 255, 0.7)'
    },
    menuFABContainer: {
      position: 'absolute',
      top: theme.spacing(2),
      left: theme.spacing(2),
      zIndex: 10
    },
  }),
);

interface ILocalProps {
}
type Props = ILocalProps;

const ProviderPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'ProviderPage'

  // External hooks
  const theme = useTheme();
  const classes = useStyles();

  // Contexts
  const serviceContext = useContext(ServiceContext);
  const navigationService = serviceContext.getService<INavigationService>(ServiceKeys.NavigationService);

  // Effects
  useEffect(() => {

    // Mount
    if (navigationService)
      navigationService.onNavigationRequest(contextName, handleNavigationRequest);

    // Unmount
    return () => {

      if (navigationService)
        navigationService.offNavigationRequest(contextName, handleNavigationRequest);
    }
  }, []);

  const handleNavigationRequest = (request: INavigationRequest) => {

    if (request.type === NavigationTypeEnumeration.Dialog) {


      return;
    }

  };

  return (

    <div className={classes.root}>

      <div className={classes.pageContainer}>

        <div className={classes.menuFABContainer}>

          <Fab
            color="primary"
            aria-label="menu">
            <MenuIcon />
          </Fab>

        </div>

        <RouterPage />

      </div>
    </div>
  );
}

export default ProviderPage;
