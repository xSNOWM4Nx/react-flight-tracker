import React, { Suspense, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';
import AppContextProvider from '../components/infrastructure/AppContextProvider.js';
import NavigationProvider from '../components/infrastructure/NavigationProvider.js';
import { navigationElements, getImportableView } from '../navigation/navigationElements.js';
import RouterPage from './RouterPage.js';
import { RESTService } from './../services/restService.js';
import { GeospatialService } from './../services/geospatialService.js';
import { OpenSkyAPIService } from './../services/openSkyAPIService.js';
import { ServiceKeys } from '../services/serviceKeys.js';
import { ThemeKeys, DarkTheme, LightTheme, PineappleTheme } from './../styles/index.js';

// Types
import type { IService } from './../services/infrastructure/serviceTypes.js';

// Styles
import 'mapbox-gl/dist/mapbox-gl.css';
import './../styles/app.style.css';

const App: React.FC = () => {

  // States
  const [themeName, setThemeName] = useState(ThemeKeys.DarkTheme);

  const getTheme = () => {

    switch (themeName) {
      case ThemeKeys.DarkTheme: {
        return DarkTheme;
      };
      case ThemeKeys.LightTheme: {
        return LightTheme;
      };
      case ThemeKeys.PineappleTheme: {
        return PineappleTheme;
      };
      default:
        return DarkTheme;
    };
  };

  const handleThemeChange = (themeName: string) => {
    setThemeName(themeName);
  };

  const handleInjectServices = () => {

    const services: Array<IService> = [];

    // REST Service
    const restService = new RESTService(ServiceKeys.RESTService);
    services.push(restService);

    // OpenSky API Service
    const openSkyAPIService = new OpenSkyAPIService(ServiceKeys.OpenSkyAPIService, import.meta.env.VITE_REACT_OSKY_CLIENT_ID, import.meta.env.VITE_REACT_OSKY_CLIENT_SECRET);
    services.push(openSkyAPIService);

    // Geospatial Service
    const geospatialService = new GeospatialService(ServiceKeys.GeospatialService);
    services.push(geospatialService);

    return services;
  };

  const renderFallback = () => {

    //const theme = getTheme();

    return (

      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignContent: 'center',
          justifyItems: 'center',
          justifyContent: 'center'
        }}>
        <CssBaseline
          enableColorScheme={true} />
        <CircularProgress
          color='primary'
          size={128} />
      </Box>
    );
  };

  return (

    <BrowserRouter>
      <ThemeProvider
        theme={getTheme()}>

        <Suspense
          fallback={renderFallback()}>

          <AppContextProvider
            onInjectServices={handleInjectServices}
            onThemeChange={handleThemeChange}>

            <NavigationProvider
              navigationItems={navigationElements}
              onInject={navigationElement => React.lazy(() => getImportableView(navigationElement.importPath))}>

              <CssBaseline
                enableColorScheme={true} />
              <RouterPage />
            </NavigationProvider>
          </AppContextProvider>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
