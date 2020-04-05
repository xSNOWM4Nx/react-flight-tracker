import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ViewInjector } from '@daniel.neuweiler/react-lib-module';

import { NavigantionElements } from './../views';

interface ILocalProps {
}
type Props = ILocalProps & RouteComponentProps<{}>;

const StartPage: React.FC<Props> = (props) => {

  const mapViewElement = NavigantionElements.find(e => e.key === "MapView");
  if (!mapViewElement)
    return null;

  return (
    <ViewInjector
      navigationElement={mapViewElement}
      onImportView={navigationElement => React.lazy(() => import(`./../${navigationElement.importPath}`))} />
  );
}

export default StartPage;
