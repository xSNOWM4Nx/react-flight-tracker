import React, { useState, useContext, useEffect, useMemo, Suspense } from 'react';
import { INavigationElementProps } from '@daniel.neuweiler/react-lib-module';
import { ViewInjector } from '@daniel.neuweiler/react-lib-module';

import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { ViewNavigationElements, ViewKeys } from './../views/navigation';

interface ILocalProps {
  navigationKey: string;
  isVisible: boolean;
  onClose: () => void;
}
type Props = ILocalProps;

const ViewInjectorDialog: React.FC<Props> = (props) => {

  // States
  const [selectedNavigationElement, setSelectedNavigationElement] = useState<INavigationElementProps>(ViewNavigationElements[0]);

  // Effects
  useEffect(() => {

    const navigationElement = ViewNavigationElements.find(navigationElement => navigationElement.key === props.navigationKey);
    if (navigationElement)
      setSelectedNavigationElement(navigationElement);

  }, [props.navigationKey]);

  const renderHeader = () => {

    return (

      <div className='primary'>
        <div className={`dialog-title`}>

          <div className='typo-h5 text-wrap-word text-left'>
            {selectedNavigationElement.display.value}
          </div>

          <div className='v2' />

          <div className={`mal`}>
            <IconButton
              className={`dialog-closebutton-root primary`}
              aria-label="Close"
              onClick={(e) => props.onClose()}>

              <CloseIcon className={`dialog-closebutton-icon`} />
            </IconButton>
          </div>

        </div>
      </div>
    )
  };

  return (

    <Dialog
      classes={{
        paper: 'view-dialog-paper default',
      }}
      fullWidth={true}
      maxWidth='md'
      open={props.isVisible}
      onClose={(e, reason) => props.onClose()}>

      {renderHeader()}

      <div className='h-100 overflow-h'>

        <ViewInjector
          navigationElement={selectedNavigationElement}
          onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
      </div>

    </Dialog>
  )
}

export default ViewInjectorDialog;
