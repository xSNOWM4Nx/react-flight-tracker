import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { INavigationRequest } from '@daniel.neuweiler/ts-lib-module';
import { ViewInjector, INavigationElementProps } from '@daniel.neuweiler/react-lib-module';

import { ViewNavigationElements, ViewKeys } from './../views/navigation';

interface ILocalProps {
  navigationRequest?: INavigationRequest;
  onNavigationError: (sourceName: string, errorMessage: string) => void;
}
type Props = ILocalProps & RouteComponentProps<{}>;

const StartPage: React.FC<Props> = (props) => {

  // States
  const [selectedNavigationElement, setSelectedNavigationElement] = useState<INavigationElementProps>(ViewNavigationElements[0]);

  // Effects
  useEffect(() => {

    // Mount
    const navigationElement = ViewNavigationElements.find(navigationElement => navigationElement.key === ViewKeys.MapView);
    if (navigationElement)
      setSelectedNavigationElement(navigationElement);

    // Unmount
    return () => {
    }
  }, []);
  useEffect(() => {

    if (!props.navigationRequest)
      return;

    const navigationElement = ViewNavigationElements.find(navigationElement => navigationElement.key === props.navigationRequest?.key);
    if (navigationElement)
      setSelectedNavigationElement(navigationElement);

    //props.onNavigationError('StartPage', `Navigation error on StartPage. ${props.navigationRequest?.key} not found.`);

  }, [props.navigationRequest]);

  return (
    <ViewInjector
      navigationElement={selectedNavigationElement}
      onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
  );
}

export default StartPage;
