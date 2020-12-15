import React, { useState, useContext, useEffect, useMemo, Suspense } from 'react';
import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';
import { ViewInjector } from '@daniel.neuweiler/react-lib-module';

import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { NavigantionElements, ErrorNavigation } from './../views';

interface ILocalProps {
  viewKey: string;
  isVisible: boolean;
  onClose: () => void;
}
type Props = ILocalProps;

const ViewInjectorDialog: React.FC<Props> = (props) => {

  // States
  const [selectedViewElement, setSelectedViewElement] = useState<NavigationElementProps>(ErrorNavigation);

  // Effects
  useEffect(() => {

    const viewElement = NavigantionElements.find(e => e.key === props.viewKey);
    if (viewElement)
      setSelectedViewElement(viewElement);

  }, [props.viewKey]);

  const renderHeader = () => {

    return (

      <div className='primary'>
        <div className={`dialog-title`}>

          <div className='typo-h5 text-wrap-word text-left'>
            {selectedViewElement.display.value}
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
          navigationElement={selectedViewElement}
          onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
      </div>

    </Dialog>
  )
}

export default ViewInjectorDialog;
