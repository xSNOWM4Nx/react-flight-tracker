
export enum NavigationTypeEnumeration {
  View,
  Dialog
};

export interface INavigationElement {
  key: string;
  name: string;
  importPath: string;
  type: NavigationTypeEnumeration;
  Icon?: React.FunctionComponent<any> | React.ComponentType<any> | string;
};

export interface INavigationElementProps {

};
