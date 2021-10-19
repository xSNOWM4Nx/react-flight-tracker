import React, { useState, useEffect } from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { INavigationElementProps, ViewInjector } from '@daniel.neuweiler/react-lib-module';
import { ViewNavigationElements, ViewKeys } from './../views/navigation';

interface ILocalProps {
  isVisible: boolean;
  navigationElement: INavigationElementProps;
  onClose: () => void;
}
type Props = ILocalProps;

const ViewInjectorDialog: React.FC<Props> = (props) => {

  // States
  const [selectedNavigationElement, setSelectedNavigationElement] = useState<INavigationElementProps>(props.navigationElement);

  // Effects
  useEffect(() => {

    const navigationElement = Object.entries(ViewNavigationElements).find(([key, navigationElement]) => navigationElement.key === props.navigationElement.key);
    if (navigationElement)
      setSelectedNavigationElement(navigationElement[1]);

  }, [props.navigationElement]);

  const renderHeader = () => {

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
            {selectedNavigationElement.display.value}
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
      sx={{
        '& .MuiDialog-paper': {
          height: '70%',
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.secondary
        },
      }}
      fullWidth={true}
      maxWidth='sm'
      open={props.isVisible}
      onClose={(e, reason) => props.onClose()}>

      {renderHeader()}

      <Box
        sx={{
          margin: (theme) => theme.spacing(1),
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>

        <ViewInjector
          navigationElement={selectedNavigationElement}
          onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
      </Box>

    </Dialog>
  )
}

export default ViewInjectorDialog;
