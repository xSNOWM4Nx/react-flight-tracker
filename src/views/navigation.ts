import { NavigationElementProps } from '@daniel.neuweiler/react-lib-module';

import ErrorIcon from '@material-ui/icons/Error';
import FlightIcon from '@material-ui/icons/Flight';
import SettingsIcon from '@material-ui/icons/Settings';
import CodeIcon from '@material-ui/icons/Code';
import InfoIcon from '@material-ui/icons/Info';

export class ViewKeys {

  public static ErrorView: string = 'ErrorView';
  public static MapView: string = 'MapView';
  public static SettingsView: string = 'SettingsView';
  public static LogView: string = 'LogView';
  public static AboutView: string = 'AboutView';
}

export const ViewNavigationElements: { [key: string]: NavigationElementProps } = {
  [ViewKeys.ErrorView]: {
    display: {
      key: "views.errorview.display",
      value: "Uuups"
    },
    key: ViewKeys.ErrorView,
    importPath: "views/ErrorView",
    icon: ErrorIcon
  },
  [ViewKeys.MapView]: {
    display: {
      key: "views.mapview.display",
      value: "Flight map"
    },
    key: ViewKeys.MapView,
    importPath: "views/MapView",
    icon: FlightIcon
  },
  [ViewKeys.SettingsView]: {
    display: {
      key: "views.settingsview.display",
      value: "Settings"
    },
    key: ViewKeys.SettingsView,
    importPath: "views/SettingsView",
    icon: SettingsIcon
  },
  [ViewKeys.LogView]: {
    display: {
      key: "views.logview.display",
      value: "Logs"
    },
    key: ViewKeys.LogView,
    importPath: "views/LogView",
    icon: CodeIcon
  },
  [ViewKeys.AboutView]: {
    display: {
      key: "views.logview.display",
      value: "About"
    },
    key: ViewKeys.AboutView,
    importPath: "views/AboutView",
    icon: InfoIcon
  }
}
