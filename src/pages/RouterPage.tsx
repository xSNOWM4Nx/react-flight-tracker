import React from 'react';
import { Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';

import StartPage from './StartPage';
import MapPage from './MapPage';
import ErrorPage from './ErrorPage';
import classes from '*.module.css';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageRoot: {
      height: '100%',
      width: '100%'
    }
  }),
);

interface ILocalProps {
}
type Props = ILocalProps;

const RouterPage: React.FC<Props> = (props) => {

  // External hooks
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  return (

    <div className={classes.pageRoot}>

      {/* Redirect to map on a unknown path */}
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
    </div>
  );
}

export default RouterPage;
