import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { teal, amber, purple, grey } from '@mui/material/colors';

const rawPineappleTheme = createTheme({
  map: {
    style: 'mapbox://styles/mapbox/dark-v10'
  },
  typography: {
    htmlFontSize: 10,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: teal[500],
    },
    secondary: {
      main: amber[500],
    },
    background: {
      paper: grey[800]
    },
    command: {
      main: purple[500],
      light: purple[400],
      dark: purple[600],
    }
  },
});

export const PineappleTheme = responsiveFontSizes(rawPineappleTheme);
