import { Theme as MUITheme } from '@mui/material/styles';

// Module augmentation MUI
declare module '@mui/material/styles' {
  interface Theme {
    map: {
      style: string;
    };
  }
  // Allow configuration using `createTheme`
  interface ThemeOptions {
    map?: {
      style?: string;
    };
  }
  interface Palette {
    command: Palette['primary'];
  }
  interface PaletteOptions {
    command: PaletteOptions['primary'];
  }
};

// Module augmentation emotion
declare module "@emotion/react" {
  export interface Theme extends MUITheme { }
};
