import React, { useState, useContext, useEffect } from 'react';
import { LogProvider } from '@daniel.neuweiler/ts-lib-module';
import { ViewContainer, LogRenderer } from '@daniel.neuweiler/react-lib-module';

interface ILocalProps {
}
type Props = ILocalProps;

const LogView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'LogView'

  return (

    <ViewContainer
      isScrollLocked={true}>

      <LogRenderer
        logs={LogProvider.archive}
        locale='de-CH'
        onLocalize={(l10nContent) => { return l10nContent.value }} />
    </ViewContainer>
  );
}

export default LogView;
