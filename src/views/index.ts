import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

export const ErrorNavigation: NavigationElementProps = {
  display: {
    key: "views.errorview.display",
    value: "Uuups"
  },
  key: "ErrorView",
  importPath: "views/ErrorView"
}

export class ViewKeys {

  public static MapView: string = 'MapView';
  public static LogView: string = 'LogView';
}

export const NavigantionElements: Array<NavigationElementProps> = [
  {
    display: {
      key: "views.mapview.display",
      value: "Flight map"
    },
    key: ViewKeys.MapView,
    importPath: "views/MapView"
  },
  {
    display: {
      key: "views.logview.display",
      value: "Logs"
    },
    key: ViewKeys.LogView,
    importPath: "views/LogView"
  }
]
