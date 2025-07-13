import React, { useContext, createContext, useState } from 'react';
import { NavigationTypeEnumeration } from '../../navigation/navigationTypes.js';
import NavigationElementDialog from './NavigationElementDialog.js';

// Types
import type { INavigationElement, INavigationElementProps } from '../../navigation/navigationTypes.js';

export interface NavigationContextType {
  currentViewElement?: INavigationElement;
  currentDialogElement?: INavigationElement;
  navigateByKey: (key: string, type?: NavigationTypeEnumeration) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
  navigationItems: Array<INavigationElement>;
  onInject: (navigationElement: INavigationElement) => React.LazyExoticComponent<React.ComponentType<INavigationElementProps>>;
  children?: React.ReactNode;
};
interface ILocalProps {
}
type Props = ILocalProps & NavigationProviderProps;

const NavigationProvider: React.FC<Props> = (props) => {

  // States
  const [currentViewElement, setCurrentViewElement] = useState<INavigationElement | undefined>(undefined);
  const [currentDialogElement, setCurrentDialogElement] = useState<INavigationElement | undefined>(undefined);

  const navigateByKey = (key: string, type?: NavigationTypeEnumeration) => {

    const navigationItem = props.navigationItems.find(item => item.key === key);
    if (!navigationItem) {
      console.warn(`Navigation item with key "${key}" not found.`);
      return;
    }

    if (type === undefined) {
      type = navigationItem.type;
    }

    if (type === NavigationTypeEnumeration.View) {
      setCurrentViewElement(navigationItem);
    } else if (type === NavigationTypeEnumeration.Dialog) {
      setCurrentDialogElement(navigationItem);
    }
  };

  return (
    <React.Fragment>

      <NavigationContext.Provider value={{ currentViewElement, currentDialogElement, navigateByKey }}>
        {props.children}
      </NavigationContext.Provider>

      <NavigationElementDialog
        isVisible={currentDialogElement !== undefined}
        navigationElement={currentDialogElement}
        onInject={props.onInject}
        onClose={() => setCurrentDialogElement(undefined)} />

    </React.Fragment>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationProvider;
