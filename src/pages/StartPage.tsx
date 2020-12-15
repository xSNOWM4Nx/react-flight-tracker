import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ViewInjector } from '@daniel.neuweiler/react-lib-module';

import { NavigantionElements, ViewKeys } from './../views';

interface ILocalProps {
}
type Props = ILocalProps & RouteComponentProps<{}>;

const StartPage: React.FC<Props> = (props) => {

  const viewElement = NavigantionElements.find(e => e.key === ViewKeys.MapView);
  if (!viewElement)
    return null;

  return (
    <ViewInjector
      navigationElement={viewElement}
      onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
  );
}

export default StartPage;
