import React from 'react';
import { Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';

import StartPage from './StartPage';
import MapPage from './MapPage';
import ErrorPage from './ErrorPage';

interface ILocalProps {
}
type Props = ILocalProps;

const RouterPage: React.FC<Props> = (props) => {

  // External hooks
  var history = useHistory();
  var location = useLocation();

  return (

    <React.Fragment>

      {/* Redirect to menu on unknown path */}
      {location.pathname === '/' ? <Redirect from="/" to="map" /> : null}

      <Switch>

        <Route
          path="/start"
          render={(routeProps) =>
            <StartPage
              {...routeProps} />
          }
        />
        <Route
          path="/map"
          render={(routeProps) =>
            <MapPage
              {...routeProps} />
          }
        />
        <Route render={(routeProps) =>
          <ErrorPage
            {...routeProps} />
        } />

      </Switch>
    </React.Fragment>
  );
}

export default RouterPage;