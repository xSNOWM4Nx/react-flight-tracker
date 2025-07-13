import { NavigationTypeEnumeration } from '../navigation/navigationTypes';

// Types
import type { INavigationElement } from '../navigation/navigationTypes';

// Icons
import FlightIcon from '@mui/icons-material/Flight';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import ErrorIcon from '@mui/icons-material/Error';

export class ViewKeys {
  public static ErrorView: string = 'ErrorView';
  public static MapView: string = 'MapView';
  public static SettingsView: string = 'SettingsView';
  public static AboutView: string = 'AboutView';
};

export const mapViewNavigationData: INavigationElement = {
  key: ViewKeys.MapView,
  name: 'Map',
  importPath: 'views/MapView',
  type: NavigationTypeEnumeration.View,
  Icon: FlightIcon
};

export const settingsViewNavigationData: INavigationElement = {
  key: ViewKeys.SettingsView,
  name: 'Settings',
  importPath: 'views/SettingsView',
  type: NavigationTypeEnumeration.Dialog,
  Icon: SettingsIcon
};

export const aboutViewNavigationData: INavigationElement = {
  key: ViewKeys.AboutView,
  name: 'About',
  importPath: 'views/AboutView',
  type: NavigationTypeEnumeration.Dialog,
  Icon: InfoIcon
};

export const errorViewNavigationData: INavigationElement = {
  key: ViewKeys.ErrorView,
  name: 'Error',
  importPath: 'views/ErrorView',
  type: NavigationTypeEnumeration.View,
  Icon: ErrorIcon
};
