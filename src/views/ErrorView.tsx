import React from 'react';
import { ViewContainer } from '@daniel.neuweiler/react-lib-module';

interface ILocalProps {
}
type Props = ILocalProps;

const ErrorView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'ErrorView'

  return (

    <ViewContainer
      isScrollLocked={true}>

    </ViewContainer>
  );
}

export default ErrorView;
