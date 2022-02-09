import React, { useContext, useRef, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Fab } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { INavigationService, ServiceKeys, INavigationRequest, NavigationTypeEnumeration } from '@daniel.neuweiler/ts-lib-module';
import { SystemContext, SelectableMenu, ISelectableProps } from '@daniel.neuweiler/react-lib-module';

import { ViewNavigationElements, ViewKeys } from './../views/navigation';
import StartPage from './StartPage';
import ErrorPage from './ErrorPage';

interface ILocalProps {
}
type Props = ILocalProps;

const RouterPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'RouterPage'

  // External hooks
  const navigate = useNavigate();

  // Contexts
  const systemContext = useContext(SystemContext);
  const navigationService = systemContext.getService<INavigationService>(ServiceKeys.NavigationService);

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
    navigate('/error');
  };

  const handleNavigationRequest = (navigationRequest: INavigationRequest) => {

    setNavigationRequest(navigationRequest);

    if (navigationRequest.url !== undefined)
      navigate(navigationRequest.url);
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

    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.primary.main
      }}>

      <Box
        sx={{
          overflow: 'hidden',
          flex: 'auto',
          margin: (theme) => theme.spacing(1),
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.secondary
        }}>

        <Box
          sx={{
            position: 'absolute',
            top: (theme) => theme.spacing(2),
            left: (theme) => theme.spacing(2),
            zIndex: 10
          }}>

          <Fab
            color="primary"
            aria-label="menu"
            onClick={handleMenuButtonClick}>

            <MenuIcon />
          </Fab>

        </Box>

        <Routes>

          {/* Redirect to 'StartPage' on a unknown path */}
          <Route
            path="/"
            element={
              <Navigate
                replace to="/start" />
            } />

          <Route
            path="/start"
            element={
              <StartPage
                navigationRequest={navigationRequest}
                onNavigationError={handleNavigationError} />
            }
          />
          <Route
            path="/error"
            element={
              <ErrorPage />
            } />

        </Routes>

        <SelectableMenu
          anchor={menuAnchor}
          items={selectableMenuItems}
          onLocalize={(localizableContent) => localizableContent.value}
          onSelect={handleMenuSelect}
          onClose={() => setMenuAnchor(null)} />

      </Box>
    </Box>
  );
}

export default RouterPage;
