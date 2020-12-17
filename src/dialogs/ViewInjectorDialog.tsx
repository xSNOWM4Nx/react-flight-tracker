import React, { useState, useContext, useEffect, useMemo, Suspense } from 'react';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { DefaultStyle } from '@daniel.neuweiler/ts-lib-module';
import { INavigationElementProps, ViewInjector } from '@daniel.neuweiler/react-lib-module';

import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import { ViewNavigationElements, ViewKeys } from './../views/navigation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogPaper: {
      height: '70%',
      backgroundColor: DefaultStyle.Palette.backgoundDark,
      color: DefaultStyle.Palette.contrast2Dark
    },
    dialogHeaderRoot: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    },
    dialogHeaderContainer: {
      margin: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'center',
      alignItems: 'center'
    },
    dialogContentContainer: {
      margin: theme.spacing(1),
      height: '100%',
      overflow: 'hidden'
    }
  }),
);

interface ILocalProps {
  isVisible: boolean;
  navigationElement: INavigationElementProps;
  onClose: () => void;
}
type Props = ILocalProps;

const ViewInjectorDialog: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();

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

      <div className={classes.dialogHeaderRoot}>

        <div className={classes.dialogHeaderContainer}>

          <Typography
            variant={'h5'}>
            {selectedNavigationElement.display.value}
          </Typography>

          <div style={{ flex: 'auto' }} />

          <IconButton
            color={'inherit'}
            aria-label="Close"
            onClick={(e) => props.onClose()}>

            <CloseIcon />
          </IconButton>

        </div>
      </div>
    )
  };

  return (

    <Dialog
      classes={{
        paper: classes.dialogPaper,
      }}
      fullWidth={true}
      maxWidth='md'
      open={props.isVisible}
      onClose={(e, reason) => props.onClose()}>

      {renderHeader()}

      <div className={classes.dialogContentContainer}>

        <ViewInjector
          navigationElement={selectedNavigationElement}
          onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
      </div>

    </Dialog>
  )
}

export default ViewInjectorDialog;
