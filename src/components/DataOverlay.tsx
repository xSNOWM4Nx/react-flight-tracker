import React from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { IStateVectorData } from '../opensky';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    overlayRoot: {
      position: 'relative',
      width: 128,
      height: 70,
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.grey[900],
      borderRadius: 4,
      opacity: 0.9,
      padding: theme.spacing(1)
    },
    textContainer: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
    },
    textDescription: {
      fontSize: 12,
      fontWeight: 800
    },
    textValue: {
      fontSize: 16,
      fontWeight: 'normal'
    }
  }),
);

interface ILocalProps {
  stateVectors: IStateVectorData;
}
type Props = ILocalProps;

const DataOverlay: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();

  return (
    <div className={classes.overlayRoot}>

      <div className={classes.textContainer}>
        <div className={classes.textDescription}>
          {'Visible flights'}
        </div>
        <div className={classes.textValue}>
          {props.stateVectors.states.length.toString()}
        </div>
      </div>

    </div>
  );
}

export default DataOverlay;