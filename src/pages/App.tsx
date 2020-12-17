import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import { IService, DefaultStyle } from '@daniel.neuweiler/ts-lib-module';
import { GlobalContextProvider, ViewContainer, Indicator1 } from '@daniel.neuweiler/react-lib-module';

import ContextPage from './ContextPage';
import RouterPage from './RouterPage';
import { OpenSkyAPIService, GeospatialService } from './../services';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@daniel.neuweiler/ts-lib-module/build/src/styles/default.style.css';
import '@daniel.neuweiler/react-lib-module/dist/styles/default.style.css';
import './../styles/app.style.css';

var theme = createMuiTheme({
  palette: {
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
      <ThemeProvider
        theme={theme}>

        <Suspense
          fallback={
            <div className="page-root">

              <ViewContainer
                isScrollLocked={true}
                backgroundColor={DefaultStyle.Palette.backgoundDark}>

                <Indicator1
                  color={theme.palette.primary.main}
                  scale={4.0} />
              </ViewContainer>
            </div>
          }>

          <GlobalContextProvider
            onInjectCustomServices={handleInjectCustomServices}>

            <ContextPage>
              <RouterPage />
            </ContextPage>
          </GlobalContextProvider>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
