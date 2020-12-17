import React, { useContext, useRef, useState, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { INavigationService, ServiceKeys, INavigationRequest, NavigationTypeEnumeration, DefaultStyle } from '@daniel.neuweiler/ts-lib-module';
import { GlobalContext, SelectableMenu, ISelectableProps } from '@daniel.neuweiler/react-lib-module';

import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';

import { ViewNavigationElements, ViewKeys } from './../views/navigation';
import StartPage from './StartPage';
import ErrorPage from './ErrorPage';

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
      backgroundColor: DefaultStyle.Palette.backgoundDark,
      color: DefaultStyle.Palette.contrast2Dark
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

const RouterPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'RouterPage'

  // External hooks
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  // Contexts
  const globalContext = useContext(GlobalContext);
  const navigationService = globalContext.getService<INavigationService>(ServiceKeys.NavigationService);

  // States
  const [navigationRequest, setNavigationRequest] = useState<INavigationRequest | undefined>(undefined);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectableMenuItems, setSelectableMenuItems] = useState<Array<ISelectableProps>>([
    ViewNavigationElements[ViewKeys.SettingsView],
    ViewNavigationElements[ViewKeys.LogView],
    ViewNavigationElements[ViewKeys.AboutView]
  ]);

  // Refs
  const navigationSubscriptionRef = useRef<string>('');
  const errorSourceNameRef = useRef('');
  const errorMessageRef = useRef('');

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

  const handleNavigationError = (sourceName: string, errorMessage: string) => {

    // Setup error references
    errorSourceNameRef.current = sourceName;
    errorMessageRef.current = errorMessage;

    // Go to error page
    history.push('/error');
  };

  const handleNavigationRequest = (navigationRequest: INavigationRequest) => {

    setNavigationRequest(navigationRequest);

    if (navigationRequest.url !== undefined)
      history.push(navigationRequest.url);
  };

  const handleMenuButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setMenuAnchor(menuAnchor ? null : e.currentTarget);
  };

  const handleMenuSelect = (e: React.MouseEvent<HTMLElement>, item: ISelectableProps, index: number) => {

    setMenuAnchor(null);

    if (navigationService)
      navigationService.show(item.key, NavigationTypeEnumeration.Dialog);
  };

  return (

    <div className={classes.root}>

      <div className={classes.pageContainer}>

        <div className={classes.menuFABContainer}>

          <Fab
            color="primary"
            aria-label="menu"
            onClick={handleMenuButtonClick}>

            <MenuIcon />
          </Fab>

        </div>

        {/* Redirect to map on a unknown path */}
        {location.pathname === '/' ? <Redirect from="/" to="start" /> : null}

        <Switch>

          <Route
            path="/start"
            render={(routeProps) =>
              <StartPage
                {...routeProps}
                navigationRequest={navigationRequest}
                onNavigationError={handleNavigationError} />
            }
          />
          <Route
            path="/error"
            render={(routeProps) =>
              <ErrorPage
                {...routeProps} />
            } />

        </Switch>

        <SelectableMenu
          anchor={menuAnchor}
          items={selectableMenuItems}
          onLocalize={(localizableContent) => localizableContent.value}
          onSelect={handleMenuSelect}
          onClose={() => setMenuAnchor(null)} />

      </div>
    </div>
  );
}

export default RouterPage;
