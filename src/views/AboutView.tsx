import React from 'react';
import { Box } from '@mui/material';
import AboutContent from '../components/infrastructure/AboutContent.js';
import { ViewKeys } from './viewKeys.js';

// Types
import type { IAboutData } from '../components/infrastructure/AboutContent.js';
import type { INavigationElementProps } from '../navigation/navigationTypes.js';

// Icons
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';

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
      ariaLabel: 'X',
      url: 'https://x.com/DanielNeuweiler',
      Icon: XIcon
    },
    {
      ariaLabel: 'Facebook',
      url: 'https://www.facebook.com/daniel.neuweiler.1/',
      Icon: FacebookIcon
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
