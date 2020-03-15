import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import { IService } from '@daniel.neuweiler/ts-lib-module';
import { ApplicationProvider } from '@daniel.neuweiler/react-lib-module';

import ProviderPage from './ProviderPage';
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

            </div>
          }>

          <ApplicationProvider
            onInjectCustomServices={handleInjectCustomServices}>

            <ProviderPage />
          </ApplicationProvider>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
