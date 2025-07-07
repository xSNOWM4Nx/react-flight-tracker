import React from 'react';
import { Box } from '@mui/material';
import AboutContent from '../components/infrastructure/AboutContent';
import { NavigationTypeEnumeration } from '../navigation/navigationTypes';
import { ViewKeys } from './viewKeys';

// Types
import type { IAboutData } from '../components/infrastructure/AboutContent';
import type { INavigationElement, INavigationElementProps } from '../navigation/navigationTypes';

// Icons
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';
import NpmIcon from './../resources/icons/npmicon.svg?react';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import ArtstationIcon from './../resources/icons/artstationicon.svg?react';
import InstagramIcon from '@mui/icons-material/Instagram';

export const aboutViewNavigationData: INavigationElement = {
  key: ViewKeys.AboutView,
  name: 'About',
  importPath: 'views/AboutView',
  type: NavigationTypeEnumeration.Dialog,
  Icon: InfoIcon
};

interface ILocalProps {
}
type Props = ILocalProps & INavigationElementProps;

const AboutView: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = ViewKeys.AboutView;

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

    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

      <AboutContent
        elements={elements} />
    </Box>
  );
}

export default AboutView;
