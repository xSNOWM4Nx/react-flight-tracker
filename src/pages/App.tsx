import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import amber from '@material-ui/core/colors/amber';
import { IService } from '@daniel.neuweiler/ts-lib-module';
import { ApplicationProvider } from '@daniel.neuweiler/react-lib-module';

import ProviderPage from './ProviderPage';
import { OpenSkyAPIService } from './../services';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@daniel.neuweiler/ts-lib-module/build/src/styles/default.style.css';
import './../styles/app.style.css';

const theme = createMuiTheme({
  palette: {
    primary: grey,
    secondary: amber,
  },
});

function App() {

  const handleInjectCustomServices = () => {

    var services: Array<IService> = [];

    var openSkyAPIService = new OpenSkyAPIService(process.env.REACT_APP_OSKY_USERNAME, process.env.REACT_APP_OSKY_PASSWORD);
    services.push(openSkyAPIService);

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
