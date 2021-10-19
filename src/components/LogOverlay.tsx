import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { LogProvider } from '@daniel.neuweiler/ts-lib-module';
import { ScrollContainer, getIconByLogLevel } from '@daniel.neuweiler/react-lib-module';

interface ILocalProps {
}
type Props = ILocalProps;

const LogOverlay: React.FC<Props> = (props) => {

  const renderLogs = () => {

    return (

      <ScrollContainer>

        {LogProvider.archive.map((log, index) => {

          var LogIcon = getIconByLogLevel(log);

          return (

            <React.Fragment
              key={index}>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  justifyItems: 'center'
                }}>

                <LogIcon />

                <Box sx={{ minWidth: (theme) => theme.spacing(1) }} />

                <Typography
                  key={index}
                  variant={'subtitle2'}
                  gutterBottom={true}>
                  {log.message}
                </Typography>
              </Box>

              <Divider
                variant="middle" />

            </React.Fragment>
          );
        })}

      </ScrollContainer>
    )
  };

  return (
    <Box
      sx={{
        overflow: 'hidden',
        position: 'relative',
        width: 160,
        height: 384,
        backgroundColor: (theme) => theme.palette.grey[500],
        color: (theme) => theme.palette.grey[900],
        borderRadius: 4,
        opacity: 0.9,
        padding: (theme) => theme.spacing(1)
      }}>

      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          alignContent: 'flex-start'
        }}>

        <Typography
          variant='body1'>
          {'Log'}
        </Typography>

        {renderLogs()}
      </Box>


    </Box>
  );
}

export default LogOverlay;