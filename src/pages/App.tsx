import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { blue, pink } from '@mui/material/colors';
import { IService } from '@daniel.neuweiler/ts-lib-module';
import { SystemContextProvider, ViewContainer, Indicator1 } from '@daniel.neuweiler/react-lib-module';

import AppContextProvider from './../contexts/AppContextProvider';
import RouterPage from './RouterPage';
import { OpenSkyAPIService, GeospatialService } from './../services';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@daniel.neuweiler/ts-lib-module/build/src/styles/default.style.css';
import '@daniel.neuweiler/react-lib-module/build/styles/default.style.css';
import './../styles/app.style.css';

var theme = createTheme({
  palette: {
    mode: 'dark',
    primary: blue,
    secondary: pink,
  },
  typography: {
    htmlFontSize: 10,
  },
});

theme = responsiveFontSizes(theme);

function App() {

  const handleInjectCustomServices = () => {

    var services: Array<IService> = [];

    var openSkyAPIService = new OpenSkyAPIService(process.env.REACT_APP_OSKY_USERNAME, process.env.REACT_APP_OSKY_PASSWORD);
    services.push(openSkyAPIService);

    var geospatialService = new GeospatialService();
    services.push(geospatialService);

    return services;
  };

  return (

    <BrowserRouter>
      <StyledEngineProvider
        injectFirst={true}>
        <ThemeProvider
          theme={theme}>

          <Suspense
            fallback={
              <div className="page-root">

                <ViewContainer
                  isScrollLocked={true}
                  backgroundColor={theme.palette.background.default}>

                  <Indicator1
                    color={theme.palette.primary.main}
                    scale={4.0} />
                </ViewContainer>
              </div>
            }>

            <SystemContextProvider
              onInjectCustomServices={handleInjectCustomServices}>

              <AppContextProvider>
                <RouterPage />
              </AppContextProvider>
            </SystemContextProvider>
          </Suspense>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  );
}

export default App;
