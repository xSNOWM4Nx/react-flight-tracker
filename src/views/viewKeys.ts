import { NavigationTypeEnumeration } from '../navigation/navigationTypes.js';

// Types
import type { INavigationElement } from '../navigation/navigationTypes.js';

// Icons
import FlightIcon from '@mui/icons-material/Flight';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';

export class ViewKeys {
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
