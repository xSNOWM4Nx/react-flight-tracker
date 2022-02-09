import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { blue, pink, purple, grey } from '@mui/material/colors';

const rawDarkTheme = createTheme({
  map: {
    style: 'mapbox://styles/mapbox/dark-v10'
  },
  typography: {
    htmlFontSize: 10,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: blue[500],
    },
    secondary: {
      main: pink[500],
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

export const DarkTheme = responsiveFontSizes(rawDarkTheme);
