import React, { useState } from 'react';
import { ThemeKeys } from './../styles';

// Definition for app context props
export interface AppContextProps {
  hasConnectionErrors: boolean;
  activeThemeName: string;
  changeTheme: (themeName: string) => void;
};

// Create the app context
export const AppContext = React.createContext<AppContextProps>({
  hasConnectionErrors: false,
  activeThemeName: ThemeKeys.DarkTheme,
  changeTheme: (themeName: string) => { }
});

interface ILocalProps {
  onThemeChange?: (themeName: string) => void;
};
type Props = ILocalProps;

const AppContextProvider: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'AppContextProvider'

  // States
  const [hasConnectionErrors, setConnectionErrors,] = useState(false);
  const [activeThemeName, setActiveThemeName] = useState(ThemeKeys.DarkTheme);

  const handleThemeChange = (themeName: string) => {

    if (props.onThemeChange)
      props.onThemeChange(themeName);

    setActiveThemeName(themeName);
  };

  return (

    <AppContext.Provider
      value={
        {
          hasConnectionErrors: hasConnectionErrors,
          activeThemeName: activeThemeName,
          changeTheme: handleThemeChange
        }} >
      {props.children}
    </AppContext.Provider>
  );
}

export default AppContextProvider;
