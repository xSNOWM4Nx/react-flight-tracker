import React, { useState, useContext, useEffect } from 'react';
import { LogProvider } from '@daniel.neuweiler/ts-lib-module';
import { ViewContainer, LogRenderer } from '@daniel.neuweiler/react-lib-module';

interface ILocalProps {
}
type Props = ILocalProps;

const AboutView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'AboutView'

  return (

    <ViewContainer
      isScrollLocked={true}>

    </ViewContainer>
  );
}

export default AboutView;
