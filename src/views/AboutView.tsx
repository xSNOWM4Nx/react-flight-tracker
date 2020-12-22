import React from 'react';
import { ViewContainer, AboutContent } from '@daniel.neuweiler/react-lib-module';

interface ILocalProps {
}
type Props = ILocalProps;

const AboutView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'AboutView'

  return (

    <ViewContainer
      isScrollLocked={true}>

      <AboutContent />
    </ViewContainer>
  );
}

export default AboutView;
