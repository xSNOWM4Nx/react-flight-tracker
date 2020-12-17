import React, { useState } from 'react';

// Definition for app context props
export interface AppContextProps {
  hasConnectionErrors: boolean;
}

// Create the app context
export const AppContext = React.createContext<AppContextProps>({
  hasConnectionErrors: false
});

interface ILocalProps {
}
type Props = ILocalProps;

const ContextPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'ContextPage'

  // States
  const [hasConnectionErrors, setConnectionErrors,] = useState(false);

  return (

    <AppContext.Provider
      value={
        {
          hasConnectionErrors: hasConnectionErrors
        }} >
      {props.children}
    </AppContext.Provider>
  );
}

export default ContextPage;
