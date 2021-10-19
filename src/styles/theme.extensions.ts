import { Theme as MUITheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // Allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
};

declare module "@emotion/react" {
  export interface Theme extends MUITheme { }
};
