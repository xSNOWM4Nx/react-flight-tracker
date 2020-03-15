import React from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';

import RouterPage from './RouterPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.primary.main
    },
    pageContainer: {
      flex: 'auto',
      margin: theme.spacing(1),
    },
    menuFABContainer: {
      position: 'absolute',
      top: theme.spacing(2),
      left: theme.spacing(2),
      zIndex: 10
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

    <div className={classes.root}>

      <div className={classes.pageContainer}>

        <div className={classes.menuFABContainer}>

          <Fab
            color="primary"
            aria-label="menu">
            <MenuIcon />
          </Fab>

        </div>

        <RouterPage />

      </div>
    </div>
  );
}

export default ProviderPage;
