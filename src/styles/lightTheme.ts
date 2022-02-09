import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { blue, pink, purple, grey } from '@mui/material/colors';

const rawLightTheme = createTheme({
  map: {
    style: 'mapbox://styles/mapbox/light-v10'
  },
  typography: {
    htmlFontSize: 10,
  },
  palette: {
    mode: 'light',
    primary: {
      main: blue[500],
    },
    secondary: {
      main: pink[500],
    },
    background: {
      paper: grey[200]
    },
    command: {
      main: purple[500],
      light: purple[400],
      dark: purple[600],
    }
  },
});

export const LightTheme = responsiveFontSizes(rawLightTheme);
