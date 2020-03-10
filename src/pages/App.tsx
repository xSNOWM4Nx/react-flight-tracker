import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import amber from '@material-ui/core/colors/amber';
import { ApplicationProvider } from '@daniel.neuweiler/react-lib-module';

import ProviderPage from './ProviderPage';

import '@daniel.neuweiler/ts-lib-module/build/src/styles/default.style.css';
import './../styles/app.style.css';

const theme = createMuiTheme({
  palette: {
    primary: grey,
    secondary: amber,
  },
});

function App() {

  return (

    <BrowserRouter>
      <ThemeProvider
        theme={theme}>

        <Suspense
          fallback={
            <div className="page-root">

            </div>
          }>

          <ApplicationProvider >
            <ProviderPage />
          </ApplicationProvider>
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
