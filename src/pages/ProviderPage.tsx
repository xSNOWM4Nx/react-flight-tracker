import React from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import RouterPage from './RouterPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbarRoot: {
      padding: 0,
      margin: theme.spacing(1),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

interface ILocalProps {
}
type Props = ILocalProps;

const ProviderPage: React.FC<Props> = (props) => {

  // External hooks
  const theme = useTheme();
  const classes = useStyles();

  return (

    <div
      className='page-root'
      style={{
        backgroundColor: '#303030'
      }}>

      <div
        style={{
          margin: 8
        }}>

        <AppBar
          position="static">

          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              className={classes.title}>
              News
          </Typography>
            <Button
              color="inherit">
              Login
          </Button>
          </Toolbar>

        </AppBar>
      </div>

      <RouterPage />
    </div>
  );
}

export default ProviderPage;
