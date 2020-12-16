import React, { useRef } from 'react';
import { Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { INavigationRequest } from '@daniel.neuweiler/ts-lib-module';

import StartPage from './StartPage';
import ErrorPage from './ErrorPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageRoot: {
      height: '100%',
      width: '100%'
    }
  }),
);

interface ILocalProps {
  navigationRequest?: INavigationRequest;
}
type Props = ILocalProps;

const RouterPage: React.FC<Props> = (props) => {

  // External hooks
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  // Refs
  const errorSourceNameRef = useRef('');
  const errorMessageRef = useRef('');

  const handleNavigationError = (sourceName: string, errorMessage: string) => {

    // Setup error references
    errorSourceNameRef.current = sourceName;
    errorMessageRef.current = errorMessage;

    // Go to error page
    history.push('/error');
  };

  return (

    <div className={classes.pageRoot}>

      {/* Redirect to map on a unknown path */}
      {location.pathname === '/' ? <Redirect from="/" to="start" /> : null}

      <Switch>

        <Route
          path="/start"
          render={(routeProps) =>
            <StartPage
              {...routeProps}
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
    </div>
  );
}

export default RouterPage;
