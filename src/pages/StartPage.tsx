import React, { useState, useEffect } from 'react';
import { INavigationRequest, NavigationTypeEnumeration } from '@daniel.neuweiler/ts-lib-module';
import { ViewInjector, INavigationElementProps } from '@daniel.neuweiler/react-lib-module';

import ViewInjectorDialog from './../dialogs/ViewInjectorDialog';
import { ViewNavigationElements, ViewKeys } from './../views/navigation';

interface ILocalProps {
  navigationRequest?: INavigationRequest;
  onNavigationError: (sourceName: string, errorMessage: string) => void;
}
type Props = ILocalProps;

const StartPage: React.FC<Props> = (props) => {

  // States
  const [selectedViewNavigationElement, setSelectedViewNavigationElement] = useState<INavigationElementProps>(ViewNavigationElements[ViewKeys.ErrorView]);
  const [selectedViewDialogNavigationElement, setSelectedViewDialogNavigationElement] = useState<INavigationElementProps>(ViewNavigationElements[ViewKeys.ErrorView]);
  const [isViewDialogVisible, setViewDialogVisible] = useState(false);

  // Effects
  useEffect(() => {

    // Mount
    const navigationElement = Object.entries(ViewNavigationElements).find(([key, navigationElement]) => navigationElement.key === ViewKeys.MapView);
    if (navigationElement)
      setSelectedViewNavigationElement(navigationElement[1]);

    // Unmount
    return () => {
    }
  }, []);
  useEffect(() => {

    if (!props.navigationRequest)
      return;

    const navigationElement = Object.entries(ViewNavigationElements).find(([key, navigationElement]) => navigationElement.key === props.navigationRequest?.key);
    if (props.navigationRequest.type === NavigationTypeEnumeration.Dialog) {

      if (navigationElement)
        setSelectedViewDialogNavigationElement(navigationElement[1]);

      setViewDialogVisible(true);
    }
    else {

      if (navigationElement)
        setSelectedViewNavigationElement(navigationElement[1]);
    }

    //props.onNavigationError('StartPage', `Navigation error on StartPage. ${props.navigationRequest?.key} not found.`);

  }, [props.navigationRequest]);

  return (

    <React.Fragment>

      <ViewInjector
        navigationElement={selectedViewNavigationElement}
        onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />

      <ViewInjectorDialog
        isVisible={isViewDialogVisible}
        navigationElement={selectedViewDialogNavigationElement}
        onClose={() => setViewDialogVisible(false)} />

    </React.Fragment>
  );
}

export default StartPage;
