import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Fab } from '@mui/material';
import { useNavigation } from '../components/infrastructure/NavigationProvider.js';
import NavigationElementMenu from '../components/infrastructure/NavigationElementMenu.js';
import { navigationElements } from '../navigation/navigationElements.js';
import { ViewKeys } from '../views/viewKeys.js';
import StartPage from './StartPage.js';
import ErrorPage from './ErrorPage.js';

// Types
import type { INavigationElement } from '../navigation/navigationTypes.js';

// Icons
import MenuIcon from '@mui/icons-material/Menu';

interface ILocalProps {
}
type Props = ILocalProps;

const RouterPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'RouterPage'

  // Hooks
  const { navigateByKey } = useNavigation();

  // States
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // Effects
  useEffect(() => {
    navigateByKey(ViewKeys.MapView);
  }, []);

  const handleMenuButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setMenuAnchor(menuAnchor ? null : e.currentTarget);
  };

  const handleMenuSelect = (e: React.MouseEvent<HTMLElement>, element: INavigationElement, index: number) => {

    setMenuAnchor(null);
    navigateByKey(element.key);
  };

  const selectableNavigationElements = navigationElements.filter((element) => {

    if (element.key === ViewKeys.MapView)
      return false;

    return true;
  });

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
              <StartPage />
            }
          />
          <Route
            path="/error"
            element={
              <ErrorPage />
            } />

        </Routes>

        <NavigationElementMenu
          anchor={menuAnchor}
          elements={selectableNavigationElements}
          onSelect={handleMenuSelect}
          onClose={() => setMenuAnchor(null)} />

      </Box>
    </Box>
  );
}

export default RouterPage;
