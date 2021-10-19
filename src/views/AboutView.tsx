import React from 'react';
import { ViewContainer, AboutContent, IAboutData } from '@daniel.neuweiler/react-lib-module';

import GitHubIcon from '@mui/icons-material/GitHub';
import { ReactComponent as NpmIcon } from './../resources/icons/npmicon.svg';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import { ReactComponent as ArtstationIcon } from './../resources/icons/artstationicon.svg';
import InstagramIcon from '@mui/icons-material/Instagram';

interface ILocalProps {
}
type Props = ILocalProps;

const AboutView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'AboutView'

  // Data seeding
  const elements: Array<IAboutData> = [
    {
      ariaLabel: 'LinkedIn',
      url: 'https://www.linkedin.com/in/daniel-neuweiler/',
      Icon: LinkedInIcon
    },
    {
      ariaLabel: 'GitHub',
      url: 'https://github.com/xSNOWM4Nx',
      Icon: GitHubIcon
    },
    {
      ariaLabel: 'Npm',
      url: 'https://www.npmjs.com/~daniel.neuweiler',
      Icon: NpmIcon
    },
    {
      ariaLabel: 'ArtStation',
      url: 'https://www.artstation.com/danielneuweiler',
      Icon: ArtstationIcon
    },
    {
      ariaLabel: 'Twitter',
      url: 'https://twitter.com/DanielNeuweiler',
      Icon: TwitterIcon
    },
    {
      ariaLabel: 'Facebook',
      url: 'https://www.facebook.com/daniel.neuweiler.1/',
      Icon: FacebookIcon
    },
    {
      ariaLabel: 'Instagram',
      url: 'https://www.instagram.com/danielneuweiler/',
      Icon: InstagramIcon
    }
  ];

  return (

    <ViewContainer
      isScrollLocked={true}>

      <AboutContent
        elements={elements} />
    </ViewContainer>
  );
}

export default AboutView;
