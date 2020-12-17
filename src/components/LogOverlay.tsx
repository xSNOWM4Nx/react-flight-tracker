import React from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { LogProvider } from '@daniel.neuweiler/ts-lib-module';
import { ScrollContainer, getIconByLogLevel } from '@daniel.neuweiler/react-lib-module';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    overlayRoot: {
      overflow: 'hidden',
      position: 'relative',
      width: 160,
      height: 384,
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.grey[900],
      borderRadius: 4,
      opacity: 0.9,
      padding: theme.spacing(1),
    },
    content: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
    },
    textDescription: {
      ...theme.typography.body1,
    },
    textValue: {
      ...theme.typography.h6,
    },
    logContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      justifyItems: 'center'
    }
  }),
);

interface ILocalProps {
}
type Props = ILocalProps;

const LogOverlay: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();
  const theme = useTheme();

  const renderLogs = () => {

    return (

      <ScrollContainer>

        {LogProvider.archive.map((log, index) => {

          var LogIcon = getIconByLogLevel(log);

          return (

            <React.Fragment
              key={index}>

              <div className={classes.logContainer}>

                <LogIcon />

                <div style={{ minWidth: theme.spacing(1) }} />

                <Typography
                  key={index}
                  variant={'subtitle2'}
                  gutterBottom={true}>
                  {log.message}
                </Typography>


              </div>

              <Divider variant="middle" />

            </React.Fragment>
          );
        })}

      </ScrollContainer>
    )
  };

  return (
    <div className={classes.overlayRoot}>

      <div className={classes.content}>
        <div className={classes.textDescription}>
          {'Log'}
        </div>

        {renderLogs()}
      </div>


    </div>
  );
}

export default LogOverlay;