import React from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import NavigationElementInjector from './NavigationElementInjector.js';

// Types
import type { INavigationElement, INavigationElementProps } from '../../navigation/navigationTypes.js';

// Icons
import CloseIcon from '@mui/icons-material/Close';

interface ILocalProps {
  isVisible: boolean;
  navigationElement: INavigationElement | undefined;
  onInject: (navigationElement: INavigationElement) => React.LazyExoticComponent<React.ComponentType<INavigationElementProps>>;
  onClose: () => void;
}
type Props = ILocalProps;

const NavigationElementDialog: React.FC<Props> = (props) => {

  const renderHeader = () => {

    let title = 'Title?';
    if (props.navigationElement) {
      title = props.navigationElement.name;
    }

    return (

      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText
        }}>

        <Box
          sx={{
            margin: (theme) => theme.spacing(1),
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center'
          }}>

          <Typography
            variant={'h5'}>
            {title}
          </Typography>

          <Box style={{ flex: 'auto' }} />

          <IconButton
            color={'inherit'}
            aria-label="Close"
            onClick={(e) => props.onClose()}>

            <CloseIcon />
          </IconButton>

        </Box>
      </Box>
    )
  };

  return (

    <Dialog
      sx={(theme) => {

        return {
          '& .MuiDialog-paper': {
            height: '70%',
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.secondary
          },
        }
      }}
      fullWidth={true}
      maxWidth='sm'
      open={props.isVisible}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onClose={(e, r) => {
        const event = e as React.SyntheticEvent<Element, Event>;
        if (event.stopPropagation)
          event.stopPropagation();
        props.onClose();
      }}>

      {renderHeader()}

      <Box
        sx={{
          margin: (theme) => theme.spacing(1),
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>

        <NavigationElementInjector
          navigationElement={props.navigationElement}
          onInject={props.onInject} />
      </Box>

    </Dialog>
  );
};

export default NavigationElementDialog;