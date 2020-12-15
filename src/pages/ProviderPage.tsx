import React, { useContext, useRef, useEffect } from 'react';
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

  // Refs
  const navigationSubscriptionRef = useRef<string>('');

  // Effects
  useEffect(() => {

    // Mount
    if (navigationService) {

      // Get a register key for the subscription and save it as reference
      const registerKey = navigationService.onNavigationRequest(contextName, handleNavigationRequest);
      navigationSubscriptionRef.current = registerKey;
    }

    // Unmount
    return () => {

      if (navigationService) {

        // Get the register key from the reference to unsubscribe
        const registerKey = navigationSubscriptionRef.current;
        navigationService.offNavigationRequest(registerKey);
      }
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
