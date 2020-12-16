import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

export class ViewKeys {

  public static ErrorView: string = 'ErrorView';
  public static MapView: string = 'MapView';
  public static LogView: string = 'LogView';
  public static AboutView: string = 'AboutView';
}

export const ViewNavigationElements: Array<NavigationElementProps> = [
  {
    display: {
      key: "views.errorview.display",
      value: "Uuups"
    },
    key: ViewKeys.ErrorView,
    importPath: "views/ErrorView"
  },
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
  },
  {
    display: {
      key: "views.logview.display",
      value: "About"
    },
    key: ViewKeys.AboutView,
    importPath: "views/AboutView"
  }
]
