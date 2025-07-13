import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';

// Types
import type { Theme } from '@mui/material';

export interface IAboutData {
  ariaLabel: string;
  url: string;
  Icon: React.FunctionComponent<any> | React.ComponentType<any>
};

interface ILocalProps {
  elements: Array<IAboutData>;
  size?: number;
};
type Props = ILocalProps;

const AboutContent: React.FC<Props> = (props) => {

  const getBoxSize = () => {

    if (props.size !== undefined)
      return props.size;

    return 256;
  };

  const renderCircleElements = () => {

    return (

      <Box
        sx={{
          height: getBoxSize(),
          width: getBoxSize(),
          color: (theme) => theme.palette.text.primary,
          fill: (theme: Theme) => theme.palette.text.primary,
          ['--offsetDegree' as any]: `${elementOffset}deg`
        }}>

        {props.elements.map((elementData, index) => {

          return (

            <Box
              key={index}
              sx={{
                position: 'absolute',
                top: 'calc(50% - 16px)',
                left: 'calc(50% - 48px)',
                animation: 'genericRotating 30s linear infinite',
                ['--offsetFactor' as any]: index
              }}>

              <IconButton
                aria-label={elementData.ariaLabel}
                onClick={() => {

                  const newWindow = window.open(elementData.url, '_blank', 'noopener,noreferrer');
                  if (newWindow) newWindow.opener = null;
                }}>
                <elementData.Icon
                  sx={{
                    height: 64,
                    minHeight: 64,
                    width: 64,
                    minWidth: 64,
                    color: (theme: Theme) => theme.palette.text.primary,
                    fill: (theme: Theme) => theme.palette.text.primary
                  }} />
              </IconButton>
            </Box>
          )
        })}
      </Box>
    );
  };

  // Get element offset
  const elementOffset = 360 / props.elements.length;

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignContent: "center",
        justifyItems: "center",
        justifyContent: "center"
      }}>

      <Box
        sx={{
          width: '100%',
          flex: 'auto'
        }}>

      </Box>

      {renderCircleElements()}

      <Box
        sx={{
          width: '100%',
          flex: 'auto',
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          alignContent: "flex-end",
          justifyItems: "flex-end",
          justifyContent: "flex-end"
        }}>

        <Typography
          variant='h6'>
          {`${new Date(Date.now()).getFullYear()} ✌️`}
        </Typography>
      </Box>

    </Box>
  );
};

export default AboutContent;
